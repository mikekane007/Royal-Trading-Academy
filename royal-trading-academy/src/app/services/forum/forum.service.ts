import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { 
  ForumThread, 
  ForumReply, 
  ForumNotification, 
  ForumStats,
  CreateThreadRequest,
  CreateReplyRequest,
  ModerateContentRequest,
  VoteRequest,
  NotificationType
} from '../../models/forum/forum.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = `${environment.apiUrl}/forum`;
  private notificationsSubject = new BehaviorSubject<ForumNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotifications();
  }

  // Thread Management
  getThreadsByCourse(courseId: string, page: number = 1, limit: number = 20): Observable<{threads: ForumThread[], total: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<{threads: ForumThread[], total: number}>(`${this.apiUrl}/courses/${courseId}/threads`, { params });
  }

  getThread(threadId: string): Observable<ForumThread> {
    return this.http.get<ForumThread>(`${this.apiUrl}/threads/${threadId}`);
  }

  createThread(request: CreateThreadRequest): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.apiUrl}/threads`, request);
  }

  updateThread(threadId: string, updates: Partial<ForumThread>): Observable<ForumThread> {
    return this.http.put<ForumThread>(`${this.apiUrl}/threads/${threadId}`, updates);
  }

  deleteThread(threadId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/threads/${threadId}`);
  }

  pinThread(threadId: string): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.apiUrl}/threads/${threadId}/pin`, {});
  }

  unpinThread(threadId: string): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.apiUrl}/threads/${threadId}/unpin`, {});
  }

  lockThread(threadId: string): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.apiUrl}/threads/${threadId}/lock`, {});
  }

  unlockThread(threadId: string): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.apiUrl}/threads/${threadId}/unlock`, {});
  }

  markThreadResolved(threadId: string): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.apiUrl}/threads/${threadId}/resolve`, {});
  }

  // Reply Management
  getRepliesByThread(threadId: string, page: number = 1, limit: number = 50): Observable<{replies: ForumReply[], total: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<{replies: ForumReply[], total: number}>(`${this.apiUrl}/threads/${threadId}/replies`, { params });
  }

  createReply(request: CreateReplyRequest): Observable<ForumReply> {
    return this.http.post<ForumReply>(`${this.apiUrl}/replies`, request);
  }

  updateReply(replyId: string, content: string): Observable<ForumReply> {
    return this.http.put<ForumReply>(`${this.apiUrl}/replies/${replyId}`, { content });
  }

  deleteReply(replyId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/replies/${replyId}`);
  }

  markBestAnswer(replyId: string): Observable<ForumReply> {
    return this.http.post<ForumReply>(`${this.apiUrl}/replies/${replyId}/best-answer`, {});
  }

  // Voting System
  voteOnContent(request: VoteRequest): Observable<{upvotes: number, downvotes: number}> {
    return this.http.post<{upvotes: number, downvotes: number}>(`${this.apiUrl}/vote`, request);
  }

  // Moderation
  moderateContent(request: ModerateContentRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/moderate`, request);
  }

  getFlaggedContent(): Observable<{threads: ForumThread[], replies: ForumReply[]}> {
    return this.http.get<{threads: ForumThread[], replies: ForumReply[]}>(`${this.apiUrl}/moderation/flagged`);
  }

  // Notifications
  getNotifications(): Observable<ForumNotification[]> {
    return this.http.get<ForumNotification[]>(`${this.apiUrl}/notifications`);
  }

  markNotificationRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/read-all`, {});
  }

  // Statistics
  getForumStats(courseId?: string): Observable<ForumStats> {
    const params = courseId ? new HttpParams().set('courseId', courseId) : new HttpParams();
    return this.http.get<ForumStats>(`${this.apiUrl}/stats`, { params });
  }

  // Search
  searchThreads(query: string, courseId?: string): Observable<ForumThread[]> {
    let params = new HttpParams().set('q', query);
    if (courseId) {
      params = params.set('courseId', courseId);
    }
    return this.http.get<ForumThread[]>(`${this.apiUrl}/search`, { params });
  }

  // Private methods
  private loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unreadCount);
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
      }
    });
  }

  // Mock data for development (remove when backend is ready)
  private getMockThreads(courseId: string): ForumThread[] {
    return [
      {
        id: '1',
        courseId,
        authorId: 'user1',
        author: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: 'STUDENT' as any,
          isInstructor: false,
          reputation: 150
        },
        title: 'Question about Risk Management in Forex Trading',
        content: 'I\'m having trouble understanding position sizing. Can someone explain the 2% rule?',
        isPinned: false,
        isLocked: false,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
        replyCount: 5,
        lastReplyAt: new Date('2024-01-15T14:20:00Z'),
        lastReplyBy: {
          id: 'instructor1',
          firstName: 'Sarah',
          lastName: 'Chen',
          profileImage: '/assets/images/instructors/sarah-chen.svg',
          role: 'INSTRUCTOR' as any,
          isInstructor: true,
          reputation: 2500
        },
        tags: ['risk-management', 'position-sizing', 'forex'],
        upvotes: 8,
        downvotes: 0,
        isResolved: true
      },
      {
        id: '2',
        courseId,
        authorId: 'user2',
        author: {
          id: 'user2',
          firstName: 'Alice',
          lastName: 'Smith',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: 'STUDENT' as any,
          isInstructor: false,
          reputation: 75
        },
        title: 'Best Trading Platforms for Beginners',
        content: 'What trading platforms do you recommend for someone just starting out?',
        isPinned: true,
        isLocked: false,
        createdAt: new Date('2024-01-14T09:15:00Z'),
        updatedAt: new Date('2024-01-14T09:15:00Z'),
        replyCount: 12,
        lastReplyAt: new Date('2024-01-16T11:45:00Z'),
        tags: ['platforms', 'beginners', 'recommendations'],
        upvotes: 15,
        downvotes: 1,
        isResolved: false
      }
    ];
  }

  private getMockReplies(threadId: string): ForumReply[] {
    return [
      {
        id: '1',
        threadId,
        authorId: 'instructor1',
        author: {
          id: 'instructor1',
          firstName: 'Sarah',
          lastName: 'Chen',
          profileImage: '/assets/images/instructors/sarah-chen.svg',
          role: 'INSTRUCTOR' as any,
          isInstructor: true,
          reputation: 2500
        },
        content: 'The 2% rule is a fundamental risk management principle. It means you should never risk more than 2% of your total account balance on a single trade. For example, if you have $10,000, you shouldn\'t risk more than $200 per trade.',
        createdAt: new Date('2024-01-15T11:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        upvotes: 12,
        downvotes: 0,
        isInstructorResponse: true,
        isBestAnswer: true,
        isModerated: false
      },
      {
        id: '2',
        threadId,
        authorId: 'user3',
        author: {
          id: 'user3',
          firstName: 'Mike',
          lastName: 'Johnson',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: 'STUDENT' as any,
          isInstructor: false,
          reputation: 200
        },
        content: 'Thanks Sarah! That makes sense. So if I want to risk $200 and my stop loss is 50 pips, I need to calculate my position size accordingly?',
        createdAt: new Date('2024-01-15T11:30:00Z'),
        updatedAt: new Date('2024-01-15T11:30:00Z'),
        upvotes: 3,
        downvotes: 0,
        isInstructorResponse: false,
        isBestAnswer: false,
        isModerated: false
      }
    ];
  }
}