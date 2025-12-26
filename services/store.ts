import { Post, User, Demand, Message } from '../types';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query,
    orderBy,
    increment,
    setDoc,
    getDoc,
    onSnapshot
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';

const POSTS_COLLECTION = 'posts';
const USERS_COLLECTION = 'users';

export const store = {
    // --- Auth ---
    getCurrentUser: (): User | null => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;
        return {
            id: currentUser.uid,
            username: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            avatarUrl: currentUser.photoURL || ''
        };
    },

    login: async (): Promise<User> => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userData: User = {
                id: user.uid,
                username: user.displayName || 'Anonymous',
                email: user.email || '',
                avatarUrl: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`
            };

            const userRef = doc(db, USERS_COLLECTION, user.uid);
            await setDoc(userRef, userData, { merge: true });

            return userData;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    },

    logout: async () => {
        await signOut(auth);
    },

    // --- Posts ---
    fetchPosts: async (): Promise<Post[]> => {
        const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    },

    addPost: async (post: Post) => {
        // Initialize Pulse
        const postWithPulse = {
            ...post,
            pulse: {
                nextRitual: Date.now() + 1000 * 60 * 60, // 1 hour from now
                isActive: false,
                participationCount: 0
            }
        };
        await setDoc(doc(db, POSTS_COLLECTION, post.id), postWithPulse);
    },

    raiseVoice: async (postId: string) => {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            voicesCount: increment(1)
        });
    },

    supportDemand: async (postId: string, demandId: string) => {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const post = postSnap.data() as Post;
            const updatedDemands = post.demands.map(d =>
                d.id === demandId ? { ...d, supportCount: d.supportCount + 1 } : d
            );
            await updateDoc(postRef, { demands: updatedDemands });
        }
    },

    // --- Rituals (The Pulse) ---
    ignitePulse: async (postId: string, isActive: boolean) => {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            'pulse.isActive': isActive,
            'pulse.participationCount': isActive ? 0 : increment(0), // Reset if starting
            'pulse.nextRitual': isActive ? Date.now() : Date.now() + 1000 * 60 * 60 * 24 // Next global ritual in 24h
        });
    },

    participateInPulse: async (postId: string) => {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            'pulse.participationCount': increment(1)
        });
    },

    // --- Faith & Progression ---
    increaseFaith: async (userId: string, amount: number) => {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            const newFaith = (userData.faithPoints || 0) + amount;
            let newRank = userData.rank || 'unbeliever';

            // Rank Logic
            if (newFaith > 50) newRank = 'disciple';
            if (newFaith > 200) newRank = 'keeper';

            await updateDoc(userRef, {
                faithPoints: newFaith,
                rank: newRank
            });
        }
    },

    // --- Real-time Chat ---
    sendMessage: async (postId: string, text: string, user: User, isAi: boolean = false) => {
        const messagesRef = collection(db, POSTS_COLLECTION, postId, 'messages');
        const newMessage: any = {
            authorId: isAi ? 'kalki_ai' : user.id,
            authorName: isAi ? 'Kalki' : user.username,
            authorAvatar: isAi ? 'https://ui-avatars.com/api/?name=Kalki&background=000&color=ea580c' : user.avatarUrl,
            text,
            timestamp: Date.now(),
            role: isAi ? 'admin' : (user.role || 'member'),
            isAi
        };
        await addDoc(messagesRef, newMessage);
    },

    subscribeToMessages: (postId: string, callback: (messages: Message[]) => void) => {
        const messagesRef = collection(db, POSTS_COLLECTION, postId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            callback(messages);
        });
    },

    joinMovement: async (postId: string, userId: string) => {
        // Increment member count
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            memberCount: increment(1)
        });
    },

    donate: async (postId: string, amount: number) => {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            fundraisedAmount: increment(amount)
        });
    }
};
