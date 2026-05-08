export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  meditationStreak: number;
  totalSessions: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  postType: 'experience' | 'journal' | 'milestone';
  isPublic: boolean;
  sessionData?: any;
  likesCount: number;
  commentsCount: number;
  likedByUser?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  goalType: 'days_streak' | 'total_sessions' | 'total_minutes';
  goalValue: number;
  startDate: string;
  endDate?: string;
  participantsCount: number;
  isParticipating?: boolean;
  userProgress?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'session_share' | 'challenge_invite';
  metadata?: any;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  participant1Id: string;
  participant1Name: string;
  participant2Id: string;
  participant2Name: string;
  participants?: string[]; // Array of user IDs for group chats
  participantNames?: { [userId: string]: string }; // Map of userId to username
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdBy?: string;
}


const STORAGE_KEYS = {
  PROFILES: 'freqyn_profiles',
  POSTS: 'freqyn_posts',
  COMMENTS: 'freqyn_comments',
  FOLLOWS: 'freqyn_follows',
  CHALLENGES: 'freqyn_challenges',
  PARTICIPANTS: 'freqyn_participants',
  LIKES: 'freqyn_likes',
  MESSAGES: 'freqyn_messages',
  CONVERSATIONS: 'freqyn_conversations'
};


export const communityStorage = {

  getProfiles: (): UserProfile[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'),
  getPosts: (): CommunityPost[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]'),
  getComments: (): Comment[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]'),
  getFollows: (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWS) || '[]'),
  getChallenges: (): Challenge[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CHALLENGES) || '[]'),
  getParticipants: (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]'),
  getLikes: (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '[]'),
  getMessages: (): Message[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]'),
  getConversations: (): Conversation[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '[]'),
  
  saveProfiles: (data: UserProfile[]) => localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data)),
  savePosts: (data: CommunityPost[]) => localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(data)),
  saveComments: (data: Comment[]) => localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(data)),
  saveFollows: (data: any[]) => localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(data)),
  saveChallenges: (data: Challenge[]) => localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(data)),
  saveParticipants: (data: any[]) => localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(data)),
  saveLikes: (data: any[]) => localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(data)),
  saveMessages: (data: Message[]) => localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data)),
  saveConversations: (data: Conversation[]) => localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data))
};