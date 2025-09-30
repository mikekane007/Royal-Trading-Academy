import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationId = 0;

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  showSuccess(message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'success',
      message,
      duration
    });
  }

  showError(message: string, duration: number = 7000): void {
    this.addNotification({
      type: 'error',
      message,
      duration
    });
  }

  showWarning(message: string, duration: number = 6000): void {
    this.addNotification({
      type: 'warning',
      message,
      duration
    });
  }

  showInfo(message: string, title?: string, duration: number = 5000): void {
    this.addNotification({
      type: 'info',
      message: title ? `${title}: ${message}` : message,
      duration
    });
  }

  showWithAction(
    message: string, 
    type: Notification['type'], 
    actionLabel: string, 
    actionCallback: () => void,
    duration: number = 10000
  ): void {
    this.addNotification({
      type,
      message,
      duration,
      action: {
        label: actionLabel,
        callback: actionCallback
      }
    });
  }

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = (++this.notificationId).toString();
    const newNotification: Notification = { ...notification, id };
    
    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, newNotification]);

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }
}