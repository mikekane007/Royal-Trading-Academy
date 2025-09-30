import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let notification of notifications$ | async; trackBy: trackByNotificationId"
        class="toast toast-{{notification.type}}"
        [class.toast-entering]="true"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <ng-container [ngSwitch]="notification.type">
              <svg *ngSwitchCase="'success'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <svg *ngSwitchCase="'error'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              <svg *ngSwitchCase="'warning'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <svg *ngSwitchDefault viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </ng-container>
          </div>
          
          <div class="toast-message">{{ notification.message }}</div>
          
          <button 
            *ngIf="notification.action"
            class="toast-action"
            (click)="handleAction(notification)"
          >
            {{ notification.action.label }}
          </button>
          
          <button 
            class="toast-close"
            (click)="closeNotification(notification.id)"
            aria-label="Close notification"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toast-notification.component.scss']
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.getNotifications();
  }

  ngOnInit(): void {
    // Component initialization if needed
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  closeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  handleAction(notification: Notification): void {
    if (notification.action) {
      notification.action.callback();
      this.closeNotification(notification.id);
    }
  }
}