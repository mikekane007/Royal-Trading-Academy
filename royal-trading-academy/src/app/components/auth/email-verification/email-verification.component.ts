import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verification-container">
      <div class="verification-card">
        <div class="verification-header">
          <div class="logo">
            <h2>Royal Trading Academy</h2>
          </div>
        </div>

        <div class="verification-content">
          <!-- Loading State -->
          <div *ngIf="isVerifying" class="verification-state">
            <div class="loading-spinner"></div>
            <h3>Verifying your email...</h3>
            <p>Please wait while we verify your email address.</p>
          </div>

          <!-- Success State -->
          <div *ngIf="verificationSuccess" class="verification-state success">
            <div class="success-icon">✅</div>
            <h3>Email Verified Successfully!</h3>
            <p>Your email address has been verified. You can now access all features of Royal Trading Academy.</p>
            <div class="actions">
              <button 
                type="button" 
                class="btn btn-primary" 
                (click)="goToDashboard()"
              >
                Go to Dashboard
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="goToHome()"
              >
                Back to Home
              </button>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="verificationError" class="verification-state error">
            <div class="error-icon">❌</div>
            <h3>Verification Failed</h3>
            <p>{{ errorMessage }}</p>
            <div class="actions">
              <button 
                type="button" 
                class="btn btn-primary" 
                (click)="resendVerification()"
                [disabled]="isResending"
              >
                <span *ngIf="isResending">Sending...</span>
                <span *ngIf="!isResending">Resend Verification Email</span>
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="goToHome()"
              >
                Back to Home
              </button>
            </div>
          </div>

          <!-- No Token State -->
          <div *ngIf="!token && !isVerifying" class="verification-state error">
            <div class="error-icon">⚠️</div>
            <h3>Invalid Verification Link</h3>
            <p>The verification link is invalid or has expired. Please request a new verification email.</p>
            <div class="actions">
              <button 
                type="button" 
                class="btn btn-primary" 
                (click)="goToLogin()"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 2rem;
    }

    .verification-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      width: 100%;
      max-width: 500px;
    }

    .verification-header {
      background: #1e3a8a;
      color: white;
      padding: 2rem;
      text-align: center;

      .logo h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }
    }

    .verification-content {
      padding: 3rem 2rem;
    }

    .verification-state {
      text-align: center;

      h3 {
        color: #1e3a8a;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1rem 0;
      }

      p {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      &.success {
        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        h3 {
          color: #16a34a;
        }
      }

      &.error {
        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        h3 {
          color: #dc2626;
        }
      }
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top: 4px solid #1e3a8a;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;

      @media (min-width: 640px) {
        flex-direction: row;
        justify-content: center;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 150px;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.btn-primary {
        background: #1e3a8a;
        color: white;

        &:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
        }
      }

      &.btn-secondary {
        background: #f8fafc;
        color: #374151;
        border-color: #e2e8f0;

        &:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
      }
    }

    @media (max-width: 640px) {
      .verification-container {
        padding: 1rem;
      }

      .verification-content {
        padding: 2rem 1.5rem;
      }
    }
  `]
})
export class EmailVerificationComponent implements OnInit {
  token: string | null = null;
  isVerifying = false;
  verificationSuccess = false;
  verificationError = false;
  errorMessage = '';
  isResending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    
    if (this.token) {
      this.verifyEmail();
    }
  }

  verifyEmail(): void {
    if (!this.token) return;

    this.isVerifying = true;
    this.verificationError = false;
    this.verificationSuccess = false;

    this.userService.verifyEmail(this.token).subscribe({
      next: (response) => {
        this.isVerifying = false;
        this.verificationSuccess = true;
        
        // Update current user verification status if logged in
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.isVerified = true;
          this.authService.updateCurrentUser(currentUser);
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.verificationError = true;
        this.errorMessage = error.message || 'Verification failed. Please try again.';
      }
    });
  }

  resendVerification(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.goToLogin();
      return;
    }

    this.isResending = true;

    this.userService.resendVerificationEmail(currentUser.id).subscribe({
      next: () => {
        this.isResending = false;
        this.errorMessage = 'Verification email sent successfully. Please check your inbox.';
      },
      error: (error) => {
        this.isResending = false;
        this.errorMessage = error.message || 'Failed to send verification email.';
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}