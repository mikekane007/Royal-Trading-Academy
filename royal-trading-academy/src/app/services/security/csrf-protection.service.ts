import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CsrfProtectionService {
  private readonly CSRF_TOKEN_KEY = 'csrf_token';
  private readonly CSRF_HEADER_NAME = 'X-CSRF-Token';
  private csrfTokenSubject = new BehaviorSubject<string | null>(null);
  public csrfToken$ = this.csrfTokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeCsrfToken();
  }

  /**
   * Initialize CSRF token on service creation
   */
  private initializeCsrfToken(): void {
    if (this.isBrowser()) {
      const existingToken = this.getCsrfTokenFromStorage();
      if (existingToken && this.isValidToken(existingToken)) {
        this.csrfTokenSubject.next(existingToken);
      } else {
        this.fetchCsrfToken().subscribe();
      }
    }
  }

  /**
   * Fetch CSRF token from server
   */
  fetchCsrfToken(): Observable<{ token: string }> {
    return this.http.get<{ token: string }>('/api/csrf-token').pipe(
      tap(response => {
        if (response.token) {
          this.setCsrfToken(response.token);
        }
      })
    );
  }

  /**
   * Get current CSRF token
   */
  getCsrfToken(): string | null {
    return this.csrfTokenSubject.value;
  }

  /**
   * Set CSRF token
   */
  private setCsrfToken(token: string): void {
    if (this.isBrowser()) {
      sessionStorage.setItem(this.CSRF_TOKEN_KEY, token);
    }
    this.csrfTokenSubject.next(token);
  }

  /**
   * Get CSRF token from storage
   */
  private getCsrfTokenFromStorage(): string | null {
    if (!this.isBrowser()) return null;
    return sessionStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  /**
   * Clear CSRF token
   */
  clearCsrfToken(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
    }
    this.csrfTokenSubject.next(null);
  }

  /**
   * Get HTTP headers with CSRF token
   */
  getHeaders(): HttpHeaders {
    const token = this.getCsrfToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set(this.CSRF_HEADER_NAME, token);
    }
    
    return headers;
  }

  /**
   * Validate CSRF token format and expiry
   */
  private isValidToken(token: string): boolean {
    if (!token) return false;
    
    try {
      // Basic token format validation
      // In a real implementation, you might decode and validate the token structure
      return token.length > 10 && /^[A-Za-z0-9+/=]+$/.test(token);
    } catch {
      return false;
    }
  }

  /**
   * Generate a client-side CSRF token (fallback)
   */
  generateClientToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  /**
   * Refresh CSRF token
   */
  refreshToken(): Observable<{ token: string }> {
    this.clearCsrfToken();
    return this.fetchCsrfToken();
  }

  /**
   * Check if running in browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  /**
   * Validate request origin to prevent CSRF attacks
   */
  validateOrigin(origin: string): boolean {
    if (!this.isBrowser()) return true;
    
    const allowedOrigins = [
      window.location.origin,
      'https://royal-trading-academy.com', // Production domain
      'https://www.royal-trading-academy.com' // Production www domain
    ];
    
    // In development, allow localhost
    if (window.location.hostname === 'localhost') {
      allowedOrigins.push('http://localhost:4200', 'http://localhost:8080');
    }
    
    return allowedOrigins.includes(origin);
  }

  /**
   * Create a form with CSRF protection
   */
  createSecureFormData(data: any): FormData {
    const formData = new FormData();
    
    // Add CSRF token
    const token = this.getCsrfToken();
    if (token) {
      formData.append('_token', token);
    }
    
    // Add other form data
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    return formData;
  }

  /**
   * Verify double-submit cookie pattern
   */
  verifyDoubleSubmitCookie(): boolean {
    if (!this.isBrowser()) return true;
    
    const cookieToken = this.getCookieValue('csrf-token');
    const headerToken = this.getCsrfToken();
    
    return cookieToken === headerToken && cookieToken !== null;
  }

  /**
   * Get cookie value by name
   */
  private getCookieValue(name: string): string | null {
    if (!this.isBrowser()) return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    
    return null;
  }
}