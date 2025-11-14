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
  lastCheckedNotifications?: { seconds: number; nanoseconds: number };
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
  | { type: 'VIDEO_SESSION'; session: Session };
  
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: { seconds: number };
  };
  unreadCount?: { [key: string]: number };
}