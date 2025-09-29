import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, UserRole } from '../../models/user/user.model';

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
  private readonly API_URL = 'http://localhost:8080/api/auth'; // TODO: Move to environment
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check token validity on service initialization only in browser
    if (this.isBrowser()) {
      this.checkTokenValidity();
    }
  }

  /**
   * Register a new user
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerData)
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
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginData)
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
   * Logout user
   */
  logout(): Observable<any> {
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
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Update current user data
   */
  updateCurrentUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  /**
   * Set authentication data
   */
  private setAuthData(authResponse: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, authResponse.token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    }
    
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login']);
  }

  /**
   * Get current user from storage
   */
  private getCurrentUserFromStorage(): User | null {
    if (!this.isBrowser()) return null;
    
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        return null;
      }
    }
    return null;
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