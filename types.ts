import { Timestamp } from 'firebase/firestore';

export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userCollege: string;
  quote: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  college: string;
  year: string;
  interests: string;
  skills: string[];
  followingCommunities?: string[];
  blockedUsers?: string[];
}

export interface Session {
  id: string;
  topic: string;
  description:string;
  creator: string;
  creatorId: string;
  participantIds: string[];
  createdAt: { seconds: number; nanoseconds: number };
  
  sessionType: 'Lecture' | 'Skill Exchange';
  scheduledAt: { seconds: number; nanoseconds: number };
  targetColleges: string[];
  targetYears: string[];
  skillsToOffer?: string[];
  skillsSought?: string[];

  // New fields for session status management
  status: 'scheduled' | 'completed';
  completedAt?: { seconds: number; nanoseconds: number };
}

export interface Community {
  id: string;
  name: string;
  description: string;
  profilePictureUrl: string;
  college: string;
  ownerId: string;
  adminIds: string[];
  followerIds?: string[];
  createdAt: { seconds: number; nanoseconds: number };
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatarName: string; // Storing the name for the avatar
  text: string;
  imageUrls?: string[];
  likes?: string[];
  createdAt: { seconds: number; nanoseconds: number };
}

export interface Comment {
  id: string;
  postId: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatarName: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export type Notification = {
  id: string;
  userId: string;
  createdAt: { seconds: number; nanoseconds: number };
  isRead: boolean;
} & (
  {
    type: 'NEW_COMMUNITY_POST';
    communityId: string;
    communityName: string;
    postId: string;
    postAuthorName: string;
  } | {
    type: 'NEW_SESSION';
    sessionId: string;
    sessionTopic: string;
    sessionCreatorName: string;
  }
);

export type View =
  | { type: 'LOADING' }
  | { type: 'LANDING' }
  | { type: 'AUTH'; isSigningUp?: boolean }
  | { type: 'CREATE_PROFILE'; email: string; uid: string }
  | { type: 'EDIT_PROFILE' }
  | { type: 'HOME' }
  | { type: 'PROFILE_DETAIL'; user: UserProfile }
  | { type: 'CHAT_INBOX' }
  | { type: 'CHAT'; chatId: string; otherUser: UserProfile }
  | { type: 'NOTIFICATIONS' }
  | { type: 'CREATE_SESSION' }
  | { type: 'MY_SESSIONS' }
  | { type: 'SKILL_SHARING' }
  | { type: 'DISCOVER_PEERS' }
  | { type: 'VIDEO_SESSION'; session: Session }
  | { type: 'COMMUNITY_AUTH' }
  | { type: 'CREATE_COMMUNITY' }
  | { type: 'COMMUNITY_PAGE'; community: Community }
  | { type: 'MY_COMMUNITIES' }
  | { type: 'COMMUNITY_ADMIN'; community: Community }
  | { type: 'COMMUNITY_POST_DETAIL'; post: CommunityPost; community: Community };

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export interface ChatConversation {
  id:string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: { seconds: number };
  };
  unreadCount?: { [key: string]: number };
}