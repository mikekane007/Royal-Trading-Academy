import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, UserRole } from '../../models/user/user.model';
import { LoadingService } from '../loading/loading.service';
import { NotificationService } from '../notification/notification.service';
import { SecureStorageService } from '../security/secure-storage.service';
import { SanitizationService } from '../security/sanitization.service';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private refreshTokenTimer?: any;
  private sessionTimeoutTimer?: any;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private secureStorage: SecureStorageService,
    private sanitizationService: SanitizationService
  ) {
    // Check token validity on service initialization only in browser
    if (this.isBrowser()) {
      this.checkTokenValidity();
      this.setupAutoRefresh();
      this.setupSessionTimeout();
    }
  }

  /**
   * Register a new user
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    // Sanitize input data
    const sanitizedData = {
      email: this.sanitizationService.sanitizeEmail(registerData.email),
      password: registerData.password, // Don't sanitize password, just validate
      firstName: this.sanitizationService.sanitizeInput(registerData.firstName),
      lastName: this.sanitizationService.sanitizeInput(registerData.lastName)
    };

    // Validate sanitized email
    if (!sanitizedData.email) {
      return throwError(() => new Error('Invalid email address'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, sanitizedData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Login user
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    // Sanitize email input
    const sanitizedEmail = this.sanitizationService.sanitizeEmail(loginData.email);
    
    if (!sanitizedEmail) {
      return throwError(() => new Error('Invalid email address'));
    }

    // Check for rate limiting
    if (this.isAccountLocked(sanitizedEmail)) {
      const lockoutTime = this.getLockoutTimeRemaining(sanitizedEmail);
      return throwError(() => new Error(`Account temporarily locked. Try again in ${Math.ceil(lockoutTime / 60000)} minutes.`));
    }

    this.loadingService.setLoadingState('login', true);
    
    const sanitizedLoginData = {
      email: sanitizedEmail,
      password: loginData.password
    };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, sanitizedLoginData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.clearLoginAttempts(sanitizedEmail);
            this.setAuthData(response);
            this.notificationService.showSuccess('Login successful! Welcome back.');
          }
        }),
        catchError(error => {
          this.recordFailedLoginAttempt(sanitizedEmail);
          this.loadingService.setLoadingState('login', false);
          return this.handleError(error);
        }),
        tap(() => this.loadingService.setLoadingState('login', false))
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    this.clearTimers();
    
    return this.http.post(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => this.clearAuthData()),
        catchError(() => {
          // Even if logout fails on server, clear local data
          this.clearAuthData();
          return throwError(() => new Error('Logout failed'));
        })
      );
  }

  /**
   * Secure logout - clears all session data
   */
  secureLogout(): void {
    this.clearTimers();
    this.clearAuthData();
    this.secureStorage.clear();
    this.notificationService.showInfo('You have been securely logged out.');
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response);
          }
        }),
        catchError(error => {
          this.clearAuthData();
          return this.handleError(error);
        })
      );
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Check if user is instructor
   */
  isInstructor(): boolean {
    return this.hasRole(UserRole.INSTRUCTOR);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.secureStorage.getAuthToken();
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.secureStorage.getRefreshToken();
  }

  /**
   * Update current user data
   */
  updateCurrentUser(user: User): void {
    // Sanitize user data before storing
    const sanitizedUser = {
      ...user,
      firstName: this.sanitizationService.sanitizeInput(user.firstName),
      lastName: this.sanitizationService.sanitizeInput(user.lastName),
      email: this.sanitizationService.sanitizeEmail(user.email)
    };
    
    this.secureStorage.setUserData(sanitizedUser);
    this.currentUserSubject.next(sanitizedUser);
  }

  /**
   * Set authentication data
   */
  private setAuthData(authResponse: AuthResponse): void {
    // Store tokens securely
    this.secureStorage.setAuthToken(authResponse.token, authResponse.refreshToken);
    
    // Sanitize and store user data
    const sanitizedUser = {
      ...authResponse.user,
      firstName: this.sanitizationService.sanitizeInput(authResponse.user.firstName),
      lastName: this.sanitizationService.sanitizeInput(authResponse.user.lastName),
      email: this.sanitizationService.sanitizeEmail(authResponse.user.email)
    };
    
    this.secureStorage.setUserData(sanitizedUser);
    this.currentUserSubject.next(sanitizedUser);
    this.isAuthenticatedSubject.next(true);
    
    // Setup automatic token refresh and session timeout
    this.setupAutoRefresh();
    this.setupSessionTimeout();
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    this.clearTimers();
    this.secureStorage.clearAuthTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get current user from storage
   */
  private getCurrentUserFromStorage(): User | null {
    return this.secureStorage.getUserData();
  }

  /**
   * Check if token exists and is not expired
   */
  private hasValidToken(): boolean {
    if (!this.isBrowser()) return false;
    
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Check if running in browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Check token validity and refresh if needed
   */
  private checkTokenValidity(): void {
    if (!this.isBrowser()) return;
    
    if (this.getToken() && !this.hasValidToken()) {
      // Token exists but is expired, try to refresh
      this.refreshToken().subscribe({
        next: () => {
          console.log('Token refreshed successfully');
        },
        error: () => {
          console.log('Token refresh failed, clearing auth data');
          this.clearAuthData();
        }
      });
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupAutoRefresh(): void {
    this.clearRefreshTimer();
    
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const refreshTime = expiryTime - this.TOKEN_REFRESH_THRESHOLD;
      const timeUntilRefresh = refreshTime - Date.now();

      if (timeUntilRefresh > 0) {
        this.refreshTokenTimer = timer(timeUntilRefresh).pipe(
          switchMap(() => this.refreshToken())
        ).subscribe({
          next: () => console.log('Token refreshed automatically'),
          error: () => this.clearAuthData()
        });
      }
    } catch (error) {
      console.error('Error setting up auto refresh:', error);
    }
  }

  /**
   * Setup session timeout
   */
  private setupSessionTimeout(): void {
    this.clearSessionTimer();
    
    // Set session timeout to 24 hours
    const sessionTimeout = 24 * 60 * 60 * 1000;
    
    this.sessionTimeoutTimer = timer(sessionTimeout).subscribe(() => {
      this.notificationService.showWarning('Your session has expired. Please log in again.');
      this.secureLogout();
    });
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearRefreshTimer();
    this.clearSessionTimer();
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTokenTimer) {
      this.refreshTokenTimer.unsubscribe();
      this.refreshTokenTimer = undefined;
    }
  }

  /**
   * Clear session timer
   */
  private clearSessionTimer(): void {
    if (this.sessionTimeoutTimer) {
      this.sessionTimeoutTimer.unsubscribe();
      this.sessionTimeoutTimer = undefined;
    }
  }

  /**
   * Record failed login attempt
   */
  private recordFailedLoginAttempt(email: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(email, attempts);
  }

  /**
   * Clear login attempts for email
   */
  private clearLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  /**
   * Check if account is locked due to failed attempts
   */
  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts || attempts.count < this.MAX_LOGIN_ATTEMPTS) {
      return false;
    }
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    return timeSinceLastAttempt < this.LOCKOUT_DURATION;
  }

  /**
   * Get remaining lockout time in milliseconds
   */
  private getLockoutTimeRemaining(email: string): number {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return 0;
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    return Math.max(0, this.LOCKOUT_DURATION - timeSinceLastAttempt);
  }

  /**
   * Validate session integrity
   */
  validateSession(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp * 1000 <= Date.now()) {
        return false;
      }
      
      // Check if user ID matches token
      if (payload.sub !== user.id) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.error && error.error.error.message) {
        errorMessage = error.error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}