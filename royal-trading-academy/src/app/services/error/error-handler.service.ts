import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private notificationService: NotificationService) {}

  handleError(error: any): void {
    console.error('Global error caught:', error);
    
    // Extract meaningful error message
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Show user-friendly error notification
    this.notificationService.showError(message);
    
    // Log error for debugging (in production, send to logging service)
    this.logError(error);
  }

  private logError(error: any): void {
    // In production, send to logging service like Sentry, LogRocket, etc.
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Error logged:', errorInfo);
  }
}