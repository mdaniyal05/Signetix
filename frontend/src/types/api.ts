/** Backend entity shapes (as returned by the Signetix REST API). */

export interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  profileStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A minimal user reference (populated in chats, messages, contacts, etc.). */
export interface UserRef {
  _id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
}

export interface UserAuthenticationRecord {
  _id: string;
  userId: string;
  isVerified: boolean;
  refreshToken?: string;
}

/** Response of /auth/users/login and /auth/users/create. */
export interface AuthResponse extends User {
  accessToken: string;
  userAuthenticationRecord: UserAuthenticationRecord;
}

/** The signed-in identity we persist locally. */
export interface AuthSession {
  userId: string;
  name: string;
  phoneNumber: string;
  accessToken: string;
  refreshToken: string;
  profilePicture?: string;
}

export interface Contact {
  _id: string;
  userId: string;
  contactUserId: UserRef;
  status: boolean;
  createdAt?: string;
}

export interface Chat {
  _id: string;
  mainUserId: UserRef;
  participants: UserRef[];
  pinnedBy: string[];
  archivedBy: string[];
  deletedBy: string[];
  lastActivity: string;
  lastMessage?: string;
  totalNumberOfMessagesInChat?: number;
  unreadCount?: number;
}

export interface MessageReplyRef {
  _id: string;
  content: string;
  senderId: UserRef;
}

export interface Message {
  _id: string;
  senderId: UserRef;
  receiverIds: UserRef[];
  chatId: string;
  content: string;
  messageType?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  isRead?: boolean;
  replyToId?: MessageReplyRef | null;
}

export interface ChatHistory {
  messages: Message[];
  totalNumberOfMessages: number;
  pinnedMessages: Message[];
  unreadCount: number;
}

export type CallType = "voice" | "video";
export type CallStatus = "declined" | "missed" | "accepted";
export type CallDirection = "incoming" | "outgoing";

export interface CallHistoryParticipant extends UserRef {
  type?: CallDirection;
}

export interface CallHistoryLog {
  _id: string;
  initiatorId: UserRef;
  participants: CallHistoryParticipant[];
  callType: CallType;
  callStatus: CallStatus;
  callDurationInSeconds: number;
  initiatedAt: string;
  deletedBy?: string[];
  createdAt?: string;
}

export type Theme = "Light" | "Dark";
export type PslLanguage = "English" | "Urdu";

export interface Settings {
  _id: string;
  userId: UserRef | string;
  theme: Theme;
  autoDownload: boolean;
  notificationEnabled: boolean;
  pslTranslationLanguage: PslLanguage;
  createdAt?: string;
  updatedAt?: string;
}
