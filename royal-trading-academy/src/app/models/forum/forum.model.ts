export interface ForumThread {
  id: string;
  courseId: string;
  authorId: string;
  author: ThreadAuthor;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  replyCount: number;
  lastReplyAt?: Date;
  lastReplyBy?: ThreadAuthor;
  tags: string[];
  upvotes: number;
  downvotes: number;
  isResolved: boolean;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  author: ThreadAuthor;
  content: string;
  parentReplyId?: string; // for nested replies
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  isInstructorResponse: boolean;
  isBestAnswer: boolean;
  isModerated: boolean;
}

export interface ThreadAuthor {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: UserRole;
  isInstructor: boolean;
  reputation: number;
}

export interface ForumNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  threadId?: string;
  replyId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ForumStats {
  totalThreads: number;
  totalReplies: number;
  activeUsers: number;
  resolvedThreads: number;
}

export enum NotificationType {
  NEW_REPLY = 'NEW_REPLY',
  THREAD_RESOLVED = 'THREAD_RESOLVED',
  INSTRUCTOR_RESPONSE = 'INSTRUCTOR_RESPONSE',
  BEST_ANSWER_SELECTED = 'BEST_ANSWER_SELECTED',
  THREAD_PINNED = 'THREAD_PINNED',
  CONTENT_MODERATED = 'CONTENT_MODERATED'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export interface CreateThreadRequest {
  courseId: string;
  title: string;
  content: string;
  tags: string[];
}

export interface CreateReplyRequest {
  threadId: string;
  content: string;
  parentReplyId?: string;
}

export interface ModerateContentRequest {
  contentId: string;
  contentType: 'thread' | 'reply';
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
}

export interface VoteRequest {
  contentId: string;
  contentType: 'thread' | 'reply';
  voteType: 'upvote' | 'downvote' | 'remove';
}