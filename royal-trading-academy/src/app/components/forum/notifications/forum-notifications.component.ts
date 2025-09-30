import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ForumService } from '../../../services/forum/forum.service';
import { ForumNotification, NotificationType } from '../../../models/forum/forum.model';

@Component({
  selector: 'app-forum-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forum-notifications.component.html',
  styleUrls: ['./forum-notifications.component.scss']
})
export class ForumNotificationsComponent implements OnInit, OnDestroy {
  notifications: ForumNotification[] = [];
  unreadCount = 0;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private forumService: ForumService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading = true;
    
    this.forumService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.updateUnreadCount();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
          this.isLoading = false;
          // Use mock data for development
          this.loadMockNotifications();
        }
      });
  }

  subscribeToNotifications(): void {
    this.forumService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.updateUnreadCount();
      });

    this.forumService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  markAsRead(notificationId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.forumService.markNotificationRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.isRead = true;
            this.updateUnreadCount();
          }
        },
        error: (error) => {
          console.error('Failed to mark notification as read:', error);
        }
      });
  }

  markAllAsRead(): void {
    this.forumService.markAllNotificationsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(notification => {
            notification.isRead = true;
          });
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Failed to mark all notifications as read:', error);
        }
      });
  }

  handleNotificationClick(notification: ForumNotification): void {
    // Mark as read if not already read
    if (!notification.isRead) {
      this.markAsRead(notification.id);
    }

    // Navigate to the relevant thread or reply
    if (notification.threadId) {
      if (notification.replyId) {
        // Navigate to specific reply in thread
        this.router.navigate(['/forum/thread', notification.threadId], {
          fragment: `reply-${notification.replyId}`
        });
      } else {
        // Navigate to thread
        this.router.navigate(['/forum/thread', notification.threadId]);
      }
    }
  }

  trackNotification(index: number, notification: ForumNotification): string {
    return notification.id;
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  private loadMockNotifications(): void {
    // Mock data for development
    this.notifications = [
      {
        id: '1',
        userId: 'current-user',
        type: NotificationType.INSTRUCTOR_RESPONSE,
        title: 'Instructor replied to your question',
        message: 'Sarah Chen responded to your question about risk management in forex trading.',
        threadId: '1',
        replyId: '1',
        isRead: false,
        createdAt: new Date('2024-01-15T11:05:00Z')
      },
      {
        id: '2',
        userId: 'current-user',
        type: NotificationType.NEW_REPLY,
        title: 'New reply in discussion',
        message: 'Mike Johnson replied to "Question about Risk Management in Forex Trading"',
        threadId: '1',
        replyId: '2',
        isRead: false,
        createdAt: new Date('2024-01-15T11:35:00Z')
      },
      {
        id: '3',
        userId: 'current-user',
        type: NotificationType.BEST_ANSWER_SELECTED,
        title: 'Your answer was marked as best',
        message: 'Your reply in "Trading Platform Recommendations" was marked as the best answer.',
        threadId: '2',
        replyId: '3',
        isRead: true,
        createdAt: new Date('2024-01-14T16:20:00Z')
      },
      {
        id: '4',
        userId: 'current-user',
        type: NotificationType.THREAD_RESOLVED,
        title: 'Discussion resolved',
        message: 'The discussion "Question about Risk Management" has been marked as resolved.',
        threadId: '1',
        isRead: true,
        createdAt: new Date('2024-01-15T14:25:00Z')
      }
    ];
    
    this.updateUnreadCount();
    this.isLoading = false;
  }
}