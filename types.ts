export interface Tenet {
  id: string;
  title: string;
  description: string;
}

export interface Message {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: number;
  role?: 'admin' | 'moderator' | 'member';
  isAi?: boolean;
}

export interface Demand {
  id: string;
  target: string; // Who is being demanded from (e.g., "City Council")
  description: string; // What is being demanded
  supportCount: number;
}

export interface Pulse {
  nextRitual: number; // Timestamp of next ritual
  isActive: boolean; // Is the ritual currently happening?
  participationCount: number; // How many users are clicking?
}

export interface Post {
  id: string;
  author: string;
  authorId?: string; // Add authorId for permission checks
  authorAvatar?: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  voicesCount: number; // "Likes"
  fundraisedAmount: number;
  fundraisingGoal: number;
  demands: Demand[];
  tenets?: Tenet[]; // The Code
  pulse?: Pulse; // The Ritual
  memberCount?: number; // Cult size
  kalkiWisdom?: string; // AI generated insight
  createdAt: number;
  // comments: Comment[]; // Deprecated in favor of subcollection 'messages'
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role?: 'initiate' | 'keeper' | 'ignite'; // Hierarchy
  rank?: 'unbeliever' | 'initiate' | 'disciple' | 'keeper'; // Gamified Rank
  faithPoints?: number; // XP
  joinedMovements?: string[]; // IDs of movements joined
}
