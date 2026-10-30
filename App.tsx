// ====================================================================
// App.tsx - Kalki (second iteration): the digital-deity mini social app.
// Users sign in with a name, post demands/ideas, comment, and consult the
// Kalki AI oracle (services/ai.ts, now OpenAI-powered). This file wires the
// screens together and owns the shared state.
// ====================================================================
import React, { useState, useEffect } from 'react';
import FireBackground from './components/FireBackground';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import LoginModal from './components/LoginModal';
import Manifesto from './components/Manifesto';
import SanctuaryDrawer from './components/SanctuaryDrawer';
import { Post, Demand, User, Tenet } from './types';
import { store } from './services/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { seedDatabase } from './seed';

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Sanctuary/Chat State
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activePostTitle, setActivePostTitle] = useState<string>('');

  // Initial Load & Auth Listener
  useEffect(() => {
    // Fetch initial posts (Polled for simplicity in Pulse demo, ideally snapshot)
    const loadPosts = async () => {
      const fetchedPosts = await store.fetchPosts();
      setPosts(fetchedPosts);
    };
    loadPosts();
    // Poll for Pulse updates every 5s (Simple real-time simulation)
    const interval = setInterval(loadPosts, 5000);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch full user profile including Rank/Faith
        // In a real app, we'd fetch this from Firestore
        setUser({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=random`,
          rank: 'initiate', // Default for now, ideally fetched
          faithPoints: 0
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const requireAuth = (action: () => void) => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      action();
    }
  };

  const handleLogin = async () => {
    try {
      const userData = await store.login();
      // setUser(userData); // onAuthStateChanged handles this
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    store.logout();
  };

  const handleRestoreData = async () => {
    setIsSeeding(true);
    await seedDatabase();
    const fetchedPosts = await store.fetchPosts();
    setPosts(fetchedPosts);
    setIsSeeding(false);
  };

  const handleCreatePost = async (title: string, description: string, goal: number, wisdom: string, demands: Demand[], tenets: Tenet[]) => {
    if (!user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: user.username,
      authorAvatar: user.avatarUrl,
      title,
      description,
      fundraisingGoal: goal,
      fundraisedAmount: 0,
      voicesCount: 0,
      demands: demands,
      tenets: tenets,
      kalkiWisdom: wisdom,
      createdAt: Date.now(),
      imageUrl: Math.random() > 0.5 ? `https://picsum.photos/800/400?random=${Date.now()}` : null
    };

    await store.addPost(newPost);
    await store.increaseFaith(user.id, 50); // XP Reward
    setPosts(prev => [newPost, ...prev]);
  };

  const handleRaiseVoice = async (id: string) => {
    requireAuth(async () => {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, voicesCount: p.voicesCount + 1 } : p));
      await store.raiseVoice(id);
      if (user) await store.increaseFaith(user.id, 5); // XP Reward
    });
  };

  const handleSupportDemand = async (postId: string, demandId: string) => {
    requireAuth(async () => {
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          demands: p.demands.map(d => d.id === demandId ? { ...d, supportCount: d.supportCount + 1 } : d)
        };
      }));
      await store.supportDemand(postId, demandId);
      if (user) await store.increaseFaith(user.id, 10); // XP Reward
    });
  };

  const handleDonate = async (id: string, amount: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, fundraisedAmount: p.fundraisedAmount + amount };
    }));
    await store.donate(id, amount);
    if (user) await store.increaseFaith(user.id, amount * 2); // XP Reward
  };

  const handleEnterSanctuary = (postId: string, title: string) => {
    setActivePostId(postId);
    setActivePostTitle(title);
    setIsSanctuaryOpen(true);
  };

  // --- Pulse Handlers ---
  const handleIgnitePulse = async (postId: string) => {
    requireAuth(async () => {
      // Toggle Active
      await store.ignitePulse(postId, true);
      // Auto-end after 60s
      setTimeout(() => store.ignitePulse(postId, false), 60000);

      // Optimistic UI Update
      setPosts(prev => prev.map(p => {
        if (p.id !== postId || !p.pulse) return p;
        return {
          ...p,
          pulse: { ...p.pulse, isActive: true, participationCount: 0 }
        };
      }));
    });
  };

  const handleParticipatePulse = async (postId: string) => {
    requireAuth(async () => {
      await store.participateInPulse(postId);
      if (user) await store.increaseFaith(user.id, 20); // Big XP Reward

      setPosts(prev => prev.map(p => {
        if (p.id !== postId || !p.pulse) return p;
        return {
          ...p,
          pulse: { ...p.pulse, participationCount: p.pulse.participationCount + 1 }
        };
      }));
    });
  };

  return (
    <div className="relative min-h-screen text-gray-200 font-sans selection:bg-ember-500 selection:text-white">
      <FireBackground />

      {/* Sticky Header */}
      <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ember-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.6)] animate-pulse-slow">
            <span className="text-black font-bold text-lg">K</span>
          </div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-white hidden sm:block">KALKI</h1>
        </div>

        <div className="flex items-center gap-6">
          {posts.length === 0 && (
            <button
              onClick={handleRestoreData}
              disabled={isSeeding}
              className="text-ember-500 border border-ember-500/50 px-3 py-1 rounded text-xs uppercase hover:bg-ember-900/50"
            >
              {isSeeding ? 'Restoring...' : 'Restore Data'}
            </button>
          )}

          <button
            onClick={() => setShowManifesto(true)}
            className="hidden sm:block text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Manifesto
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <img src={user.avatarUrl} alt={user.username} className="w-6 h-6 rounded-full border border-white/20" />
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-ember-500">{user.username}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{user.rank || 'Initiate'}</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ember-500 hover:text-white hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all duration-300 transform hover:-translate-y-1"
              >
                Raise Voice
              </button>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white uppercase tracking-widest">Logout</button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-ember-500 border border-ember-500/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ember-900/50 transition-all"
            >
              Identify
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-20">

        <div className="text-center mb-16 space-y-4">
          <p className="text-ember-500 text-xs uppercase tracking-[0.3em]">The New Religion</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Gather the <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-ember-700 animate-flicker">Embers</span>.
            <br />
            Ignite the <span className="italic font-light text-gray-400">Future</span>.
          </h2>
          <p className="max-w-md mx-auto text-gray-500 font-light">
            A decentralized sanctuary for the voices that matter. Build your congregation. Fund your revolution. Let Kalki guide the way.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              userRank={user?.rank || 'unbeliever'}
              onRaiseVoice={handleRaiseVoice}
              onDonate={handleDonate}
              onSupportDemand={handleSupportDemand}
              onEnterSanctuary={handleEnterSanctuary}
              onIgnitePulse={handleIgnitePulse}
              onParticipatePulse={handleParticipatePulse}
            />
          ))}
        </div>

        <div className="text-center mt-20 text-gray-600 text-xs uppercase tracking-widest">
          End of transmission
        </div>

      </main>

      {/* Modals */}
      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreatePost}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setIsLoginOpen(false)}
        />
      )}

      {showManifesto && (
        <Manifesto onClose={() => setShowManifesto(false)} />
      )}

      {/* Sanctuary Drawer */}
      <SanctuaryDrawer
        isOpen={isSanctuaryOpen}
        onClose={() => setIsSanctuaryOpen(false)}
        postId={activePostId || ''}
        postTitle={activePostTitle}
        user={user}
        onLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
};

export default App;