import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, UserProfile, TradingExperience } from '../../models/user/user.model';

export interface UserProfileResponse {
  success: boolean;
  user: User;
  profile: UserProfile;
  message?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  profile: {
    bio?: string;
    phone?: string;
    country?: string;
    timezone?: string;
    tradingExperience?: TradingExperience;
    interests?: string[];
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/users'; // TODO: Move to environment

  constructor(private http: HttpClient) {}

  /**
   * Get user profile data
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfileResponse>(`${this.API_URL}/${userId}/profile`)
      .pipe(
        map(response => response.profile),
        catchError(this.handleError)
      );
  }

  /**
   * Update user profile
   */
  updateUserProfile(userId: string, updateData: UpdateProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.API_URL}/${userId}/profile`, updateData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Change user password
   */
  changePassword(userId: string, passwordData: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.API_URL}/${userId}/password`, passwordData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload profile image
   */
  uploadProfileImage(userId: string, imageFile: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<ImageUploadResponse>(`${this.API_URL}/${userId}/profile-image`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Resend email verification
   */
  resendVerificationEmail(userId: string): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.API_URL}/${userId}/resend-verification`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verify email with token
   */
  verifyEmail(token: string): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.API_URL}/verify-email`, { token })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get user dashboard data
   */
  getUserDashboard(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${userId}/dashboard`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get user progress for a specific course
   */
  getUserProgress(userId: string, courseId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${userId}/progress/${courseId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete user account
   */
  deleteAccount(userId: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${userId}`, {
      body: { password }
    })
      .pipe(
        catchError(this.handleError)
      );
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

    console.error('User Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}