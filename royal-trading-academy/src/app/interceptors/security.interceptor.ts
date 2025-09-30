import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CsrfProtectionService } from '../services/security/csrf-protection.service';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {

  constructor(private csrfService: CsrfProtectionService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let secureRequest = request;

    // Add security headers
    secureRequest = this.addSecurityHeaders(secureRequest);

    // Add CSRF protection for state-changing requests
    if (this.isStateChangingRequest(request.method)) {
      secureRequest = this.addCsrfProtection(secureRequest);
    }

    // Validate origin for sensitive requests
    if (this.isSensitiveRequest(request.url)) {
      if (!this.validateOrigin()) {
        throw new Error('Invalid request origin');
      }
    }

    return next.handle(secureRequest);
  }

  /**
   * Add security headers to request
   */
  private addSecurityHeaders(request: HttpRequest<any>): HttpRequest<any> {
    let headers = request.headers;

    // Add Content-Type if not present for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && !headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }

    // Add X-Requested-With header to identify AJAX requests
    headers = headers.set('X-Requested-With', 'XMLHttpRequest');

    // Add Cache-Control for sensitive requests
    if (this.isSensitiveRequest(request.url)) {
      headers = headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers = headers.set('Pragma', 'no-cache');
      headers = headers.set('Expires', '0');
    }

    return request.clone({ headers });
  }

  /**
   * Add CSRF protection to request
   */
  private addCsrfProtection(request: HttpRequest<any>): HttpRequest<any> {
    const csrfHeaders = this.csrfService.getHeaders();
    let headers = request.headers;

    // Merge CSRF headers
    csrfHeaders.keys().forEach(key => {
      const value = csrfHeaders.get(key);
      if (value) {
        headers = headers.set(key, value);
      }
    });

    return request.clone({ headers });
  }

  /**
   * Check if request method is state-changing
   */
  private isStateChangingRequest(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  /**
   * Check if request is to a sensitive endpoint
   */
  private isSensitiveRequest(url: string): boolean {
    const sensitivePatterns = [
      '/api/auth/',
      '/api/users/',
      '/api/payments/',
      '/api/admin/',
      '/api/profile/'
    ];

    return sensitivePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Validate request origin
   */
  private validateOrigin(): boolean {
    if (typeof window === 'undefined') return true;

    const origin = window.location.origin;
    return this.csrfService.validateOrigin(origin);
  }
}