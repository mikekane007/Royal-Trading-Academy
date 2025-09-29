import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/user/user.model';

@Component({
  selector: 'app-account-deletion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="account-deletion-container">
      <div class="deletion-card">
        <div class="deletion-header">
          <div class="warning-icon">⚠️</div>
          <h2>Delete Account</h2>
          <p>This action cannot be undone. Please be certain.</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="alert alert-error">
          <i class="icon-error"></i>
          <span>{{ error }}</span>
          <button type="button" class="close-btn" (click)="clearMessages()">×</button>
        </div>

        <div class="deletion-content">
          <div class="warning-section">
            <h3>What will happen when you delete your account:</h3>
            <ul class="consequences-list">
              <li>
                <i class="icon-warning"></i>
                Your profile and personal information will be permanently deleted
              </li>
              <li>
                <i class="icon-warning"></i>
                You will lose access to all enrolled courses and progress
              </li>
              <li>
                <i class="icon-warning"></i>
                Your subscription will be cancelled immediately
              </li>
              <li>
                <i class="icon-warning"></i>
                All forum posts and comments will be anonymized
              </li>
              <li>
                <i class="icon-warning"></i>
                You will not be able to recover your account or data
              </li>
            </ul>
          </div>

          <div class="alternatives-section">
            <h3>Consider these alternatives:</h3>
            <div class="alternatives-grid">
              <div class="alternative-card">
                <h4>Pause Subscription</h4>
                <p>Temporarily suspend your subscription instead of deleting your account</p>
                <button type="button" class="btn btn-outline" (click)="pauseSubscription()">
                  Pause Subscription
                </button>
              </div>
              <div class="alternative-card">
                <h4>Download Data</h4>
                <p>Export your course progress and personal data before deletion</p>
                <button type="button" class="btn btn-outline" (click)="downloadData()">
                  Download Data
                </button>
              </div>
            </div>
          </div>

          <form [formGroup]="deletionForm" (ngSubmit)="deleteAccount()" class="deletion-form">
            <div class="confirmation-section">
              <h3>Confirm Account Deletion</h3>
              <p>To confirm deletion, please enter your password and type "DELETE" in the field below:</p>
              
              <div class="form-group">
                <label for="password">Current Password *</label>
                <input 
                  id="password"
                  type="password" 
                  formControlName="password"
                  placeholder="Enter your current password"
                  [class.error]="getFieldError('password')"
                />
                <div *ngIf="getFieldError('password')" class="field-error">
                  {{ getFieldError('password') }}
                </div>
              </div>

              <div class="form-group">
                <label for="confirmation">Type "DELETE" to confirm *</label>
                <input 
                  id="confirmation"
                  type="text" 
                  formControlName="confirmation"
                  placeholder="Type DELETE to confirm"
                  [class.error]="getFieldError('confirmation')"
                />
                <div *ngIf="getFieldError('confirmation')" class="field-error">
                  {{ getFieldError('confirmation') }}
                </div>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="acknowledged"
                    [class.error]="getFieldError('acknowledged')"
                  />
                  <span class="checkmark"></span>
                  I understand that this action cannot be undone and I will lose all my data permanently
                </label>
                <div *ngIf="getFieldError('acknowledged')" class="field-error">
                  {{ getFieldError('acknowledged') }}
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="goBack()"
                [disabled]="isDeleting"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-danger"
                [disabled]="deletionForm.invalid || isDeleting"
              >
                <span *ngIf="isDeleting">Deleting Account...</span>
                <span *ngIf="!isDeleting">Delete My Account</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-deletion-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      padding: 2rem;
    }

    .deletion-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      width: 100%;
      max-width: 800px;
    }

    .deletion-header {
      background: #dc2626;
      color: white;
      padding: 2rem;
      text-align: center;

      .warning-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
        font-weight: 700;
      }

      p {
        margin: 0;
        opacity: 0.9;
        font-size: 1.1rem;
      }
    }

    .deletion-content {
      padding: 2rem;
    }

    .alert {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      position: relative;

      &.alert-error {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
      }

      .close-btn {
        position: absolute;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;

        &:hover {
          opacity: 1;
        }
      }
    }

    .warning-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;

      h3 {
        color: #dc2626;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .consequences-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          color: #7f1d1d;
          line-height: 1.5;

          .icon-warning {
            color: #dc2626;
            margin-top: 0.125rem;
          }
        }
      }
    }

    .alternatives-section {
      margin-bottom: 2rem;

      h3 {
        color: #374151;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .alternatives-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .alternative-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;

        h4 {
          color: #1e3a8a;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
      }
    }

    .deletion-form {
      .confirmation-section {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 2rem;

        h3 {
          color: #dc2626;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        > p {
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
      }

      .form-group {
        margin-bottom: 1.5rem;

        label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;

          &.checkbox-label {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            cursor: pointer;
            font-weight: 500;
            line-height: 1.5;

            input[type="checkbox"] {
              margin: 0;
              width: 18px;
              height: 18px;
              margin-top: 0.125rem;
            }
          }
        }

        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;

          &:focus {
            outline: none;
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          }

          &.error {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
          }
        }

        .field-error {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 2rem;
        border-top: 1px solid #e2e8f0;

        @media (max-width: 640px) {
          flex-direction: column-reverse;
        }
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
      min-width: 120px;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

      &.btn-outline {
        background: transparent;
        color: #1e3a8a;
        border-color: #1e3a8a;

        &:hover:not(:disabled) {
          background: #1e3a8a;
          color: white;
        }
      }

      &.btn-danger {
        background: #dc2626;
        color: white;

        &:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }
      }
    }

    // Icon classes
    .icon-warning::before { content: "⚠️"; }
    .icon-error::before { content: "❌"; }

    @media (max-width: 768px) {
      .account-deletion-container {
        padding: 1rem;
      }

      .deletion-content {
        padding: 1.5rem;
      }

      .alternatives-section .alternatives-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountDeletionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  deletionForm: FormGroup;
  isDeleting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.deletionForm = this.createDeletionForm();
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createDeletionForm(): FormGroup {
    return this.fb.group({
      password: ['', [Validators.required]],
      confirmation: ['', [Validators.required, this.deleteConfirmationValidator]],
      acknowledged: [false, [Validators.requiredTrue]]
    });
  }

  private deleteConfirmationValidator(control: any) {
    if (control.value !== 'DELETE') {
      return { confirmationMismatch: true };
    }
    return null;
  }

  deleteAccount(): void {
    if (this.deletionForm.valid && this.user) {
      this.isDeleting = true;
      this.error = null;

      const formValue = this.deletionForm.value;

      this.userService.deleteAccount(this.user.id, formValue.password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Account deleted successfully
            this.authService.logout().subscribe({
              next: () => {
                this.router.navigate(['/'], { 
                  queryParams: { message: 'Account deleted successfully' }
                });
              },
              error: () => {
                // Even if logout fails, redirect to home
                this.router.navigate(['/'], { 
                  queryParams: { message: 'Account deleted successfully' }
                });
              }
            });
          },
          error: (error) => {
            this.error = 'Failed to delete account: ' + error.message;
            this.isDeleting = false;
          }
        });
    }
  }

  pauseSubscription(): void {
    this.router.navigate(['/subscription']);
  }

  downloadData(): void {
    // Implement data export functionality
    console.log('Download user data');
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.deletionForm.get(fieldName);
    
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors?.['requiredTrue']) {
        return 'You must acknowledge this action';
      }
      if (field.errors?.['confirmationMismatch']) {
        return 'Please type "DELETE" to confirm';
      }
    }
    
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      password: 'Password',
      confirmation: 'Confirmation',
      acknowledged: 'Acknowledgment'
    };
    
    return labels[fieldName] || fieldName;
  }

  clearMessages(): void {
    this.error = null;
  }
}