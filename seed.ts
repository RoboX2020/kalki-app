import { store } from './services/store';

const INITIAL_POSTS = [
    {
        id: '1',
        author: 'NeoGen_X',
        authorAvatar: 'https://ui-avatars.com/api/?name=NeoGen_X&background=random',
        title: 'Digital Minimalism',
        description: 'We are drowning in noise. We demand a right to disconnect. This movement is about reclaiming our mental space from the algorithms that seek to enslave our attention spans.',
        voicesCount: 1243,
        fundraisedAmount: 4500,
        fundraisingGoal: 10000,
        imageUrl: 'https://picsum.photos/800/400?grayscale',
        kalkiWisdom: "Silence is the only weapon that cannot be hacked.",
        createdAt: Date.now() - 10000000,
        demands: [
            { id: 'd1', target: 'Tech Giants', description: 'Implement mandatory "Right to Disconnect" settings enabled by default.', supportCount: 850 },
            { id: 'd2', target: 'Department of Education', description: 'Ban smartphone usage in primary schools completely.', supportCount: 420 }
        ],
        comments: [
            { id: 'c1', author: 'Cipher', text: 'The noise is deafening.', timestamp: Date.now() - 50000 },
            { id: 'c2', author: 'Kalki', text: 'Disconnect to reconnect.', timestamp: Date.now() - 40000, isAi: true }
        ]
    },
    {
        id: '2',
        author: 'Gaia_Reborn',
        authorAvatar: 'https://ui-avatars.com/api/?name=Gaia_Reborn&background=random',
        title: 'Urban Reforestation',
        description: 'Concrete veins need green blood. We propose a guerilla gardening initiative to reclaim abandoned urban lots for micro-forests.',
        voicesCount: 892,
        fundraisedAmount: 1200,
        fundraisingGoal: 5000,
        kalkiWisdom: "When the roots are strong, the concrete will crack.",
        createdAt: Date.now() - 5000000,
        demands: [
            { id: 'd3', target: 'City Council', description: 'Rezone 5% of parking lots into community gardens.', supportCount: 300 }
        ],
        comments: []
    }
];

export const seedDatabase = async () => {
    console.log("Seeding database...");
    for (const post of INITIAL_POSTS) {
        await store.addPost(post);
        console.log(`Added post: ${post.title}`);
    }
    console.log("Seeding complete.");
};
