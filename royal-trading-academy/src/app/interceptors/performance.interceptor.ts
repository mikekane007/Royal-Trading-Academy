import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements HttpInterceptor {
  private pendingRequests = new Map<string, number>();
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = performance.now();
    const requestId = this.generateRequestId(req);
    
    // Track pending requests to prevent duplicate requests
    if (this.pendingRequests.has(requestId)) {
      console.warn('Duplicate request detected:', req.url);
    }
    this.pendingRequests.set(requestId, startTime);
    
    // Add performance headers
    const optimizedRequest = req.clone({
      setHeaders: {
        'X-Request-ID': requestId,
        'X-Request-Start': startTime.toString()
      }
    });
    
    return next.handle(optimizedRequest).pipe(
      tap(event => {
        // Log successful responses
        if (event.type === 4) { // HttpEventType.Response
          const duration = performance.now() - startTime;
          this.logRequestPerformance(req, duration, true);
        }
      }),
      finalize(() => {
        // Clean up pending requests
        this.pendingRequests.delete(requestId);
        
        const duration = performance.now() - startTime;
        
        // Log slow requests
        if (duration > 2000) {
          console.warn('Slow request detected:', {
            url: req.url,
            method: req.method,
            duration: `${duration.toFixed(2)}ms`
          });
        }
      })
    );
  }
  
  private generateRequestId(req: HttpRequest<any>): string {
    return `${req.method}:${req.url}:${Date.now()}`;
  }
  
  private logRequestPerformance(req: HttpRequest<any>, duration: number, success: boolean): void {
    const logData = {
      url: req.url,
      method: req.method,
      duration: `${duration.toFixed(2)}ms`,
      success,
      timestamp: new Date().toISOString()
    };
    
    // Log to console in development
    if (duration > 1000) {
      console.log('Request Performance:', logData);
    }
    
    // Send to analytics in production
    this.sendPerformanceMetrics(logData);
  }
  
  private sendPerformanceMetrics(data: any): void {
    // Implement analytics sending logic
    // This could integrate with Google Analytics, custom analytics, etc.
    
    // Example: Send to custom analytics endpoint
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify(data));
    }
  }
  
  public getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
  
  public getPendingRequests(): string[] {
    return Array.from(this.pendingRequests.keys());
  }
}