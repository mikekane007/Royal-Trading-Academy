import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NotificationService } from '../services/notification/notification.service';
import { LoadingService } from '../services/loading/loading.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(this.shouldRetry(request) ? 1 : 0),
      catchError((error: HttpErrorResponse) => {
        this.loadingService.setLoading(false);
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private shouldRetry(request: HttpRequest<any>): boolean {
    // Only retry GET requests and avoid retrying authentication endpoints
    return request.method === 'GET' && 
           !request.url.includes('/auth/') &&
           !request.url.includes('/login') &&
           !request.url.includes('/register');
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred';
    let showNotification = true;

    switch (error.status) {
      case 0:
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
        break;

      case 400:
        // Bad Request
        errorMessage = error.error?.message || 'Invalid request. Please check your input.';
        break;

      case 401:
        // Unauthorized
        errorMessage = 'Your session has expired. Please log in again.';
        this.handleUnauthorized();
        break;

      case 403:
        // Forbidden
        errorMessage = 'You do not have permission to perform this action.';
        break;

      case 404:
        // Not Found
        errorMessage = 'The requested resource was not found.';
        break;

      case 409:
        // Conflict
        errorMessage = error.error?.message || 'A conflict occurred. Please try again.';
        break;

      case 422:
        // Unprocessable Entity (Validation errors)
        errorMessage = this.extractValidationErrors(error);
        break;

      case 429:
        // Too Many Requests
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
        break;

      case 500:
        // Internal Server Error
        errorMessage = 'Server error. Please try again later.';
        break;

      case 502:
      case 503:
      case 504:
        // Bad Gateway, Service Unavailable, Gateway Timeout
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        break;

      default:
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        break;
    }

    // Log error for debugging
    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    // Show notification unless it's a validation error (handled by forms)
    if (showNotification && error.status !== 422) {
      this.notificationService.showError(errorMessage);
    }

    // Handle specific error scenarios
    this.handleSpecificErrors(error);
  }

  private extractValidationErrors(error: HttpErrorResponse): string {
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.map((err: any) => err.message || err).join(', ');
    }
    
    if (error.error?.message) {
      return error.error.message;
    }

    return 'Validation failed. Please check your input.';
  }

  private handleUnauthorized(): void {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }

  private handleSpecificErrors(error: HttpErrorResponse): void {
    // Handle payment errors
    if (error.url?.includes('/payment') || error.url?.includes('/subscription')) {
      if (error.status === 402) {
        this.notificationService.showError('Payment required. Please update your payment method.');
      }
    }

    // Handle file upload errors
    if (error.url?.includes('/upload')) {
      if (error.status === 413) {
        this.notificationService.showError('File too large. Please choose a smaller file.');
      }
    }

    // Handle course enrollment errors
    if (error.url?.includes('/enroll')) {
      if (error.status === 409) {
        this.notificationService.showError('You are already enrolled in this course.');
      }
    }

    // Handle critical errors that might need page refresh
    if (error.status >= 500 && error.status < 600) {
      this.notificationService.showWithAction(
        'A server error occurred. You may need to refresh the page.',
        'error',
        'Refresh Page',
        () => window.location.reload(),
        10000
      );
    }
  }
}