import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { SubscriptionService } from '../../../services/subscription/subscription.service';
import { User, SubscriptionStatus } from '../../../models/user/user.model';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="subscription-container">
      <div class="subscription-header">
        <h1>Subscription Management</h1>
        <p>Manage your Royal Trading Academy subscription and billing</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading subscription details...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="alert alert-error">
        <i class="icon-error"></i>
        <span>{{ error }}</span>
        <button type="button" class="close-btn" (click)="clearMessages()">×</button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="alert alert-success">
        <i class="icon-success"></i>
        <span>{{ successMessage }}</span>
        <button type="button" class="close-btn" (click)="clearMessages()">×</button>
      </div>

      <div *ngIf="user && !loading" class="subscription-content">
        
        <!-- Current Subscription Status -->
        <div class="current-subscription-section">
          <h2>Current Subscription</h2>
          
          <div *ngIf="currentSubscription" class="subscription-card active">
            <div class="subscription-header-info">
              <h3>{{ currentSubscription.plan.name }}</h3>
              <div class="subscription-status" [class]="getSubscriptionStatusClass()">
                {{ getSubscriptionStatusLabel() }}
              </div>
            </div>
            
            <div class="subscription-details">
              <div class="detail-item">
                <label>Plan</label>
                <span>{{ currentSubscription.plan.name }}</span>
              </div>
              <div class="detail-item">
                <label>Price</label>
                <span>\${{ currentSubscription.plan.price }}/{{ currentSubscription.plan.interval }}</span>
              </div>
              <div class="detail-item">
                <label>Current Period</label>
                <span>{{ currentSubscription.currentPeriodStart | date:'mediumDate' }} - {{ currentSubscription.currentPeriodEnd | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item" *ngIf="currentSubscription.cancelAtPeriodEnd">
                <label>Cancellation</label>
                <span class="cancellation-notice">Will cancel on {{ currentSubscription.currentPeriodEnd | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="subscription-features">
              <h4>Plan Features</h4>
              <ul>
                <li *ngFor="let feature of currentSubscription.plan.features">
                  <i class="icon-check"></i>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div class="subscription-actions">
              <button 
                *ngIf="!currentSubscription.cancelAtPeriodEnd && currentSubscription.status === 'ACTIVE'" 
                type="button" 
                class="btn btn-outline btn-danger" 
                (click)="cancelSubscription()"
                [disabled]="isProcessing"
              >
                <span *ngIf="isProcessing">Processing...</span>
                <span *ngIf="!isProcessing">Cancel Subscription</span>
              </button>
              
              <button 
                *ngIf="currentSubscription.cancelAtPeriodEnd" 
                type="button" 
                class="btn btn-primary" 
                (click)="reactivateSubscription()"
                [disabled]="isProcessing"
              >
                <span *ngIf="isProcessing">Processing...</span>
                <span *ngIf="!isProcessing">Reactivate Subscription</span>
              </button>

              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="viewBillingHistory()"
              >
                View Billing History
              </button>
            </div>
          </div>

          <!-- No Active Subscription -->
          <div *ngIf="!currentSubscription" class="no-subscription-card">
            <div class="no-subscription-content">
              <div class="no-subscription-icon">📚</div>
              <h3>No Active Subscription</h3>
              <p>Subscribe to Royal Trading Academy to access premium courses and features.</p>
              <button 
                type="button" 
                class="btn btn-primary" 
                (click)="showAvailablePlans = true"
              >
                View Available Plans
              </button>
            </div>
          </div>
        </div>

        <!-- Available Plans -->
        <div *ngIf="showAvailablePlans || !currentSubscription" class="available-plans-section">
          <h2>Available Plans</h2>
          <p>Choose the plan that best fits your trading education needs</p>

          <div class="plans-grid">
            <div 
              *ngFor="let plan of availablePlans" 
              class="plan-card"
              [class.popular]="plan.isPopular"
            >
              <div *ngIf="plan.isPopular" class="popular-badge">Most Popular</div>
              
              <div class="plan-header">
                <h3>{{ plan.name }}</h3>
                <div class="plan-price">
                  <span class="price">\${{ plan.price }}</span>
                  <span class="interval">/{{ plan.interval }}</span>
                </div>
                <p class="plan-description">{{ plan.description }}</p>
              </div>

              <div class="plan-features">
                <ul>
                  <li *ngFor="let feature of plan.features">
                    <i class="icon-check"></i>
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <div class="plan-actions">
                <button 
                  type="button" 
                  class="btn"
                  [class.btn-primary]="plan.isPopular"
                  [class.btn-outline]="!plan.isPopular"
                  (click)="subscribeToPlan(plan)"
                  [disabled]="isProcessing || (currentSubscription && currentSubscription.plan.id === plan.id)"
                >
                  <span *ngIf="isProcessing">Processing...</span>
                  <span *ngIf="!isProcessing && currentSubscription && currentSubscription.plan.id === plan.id">Current Plan</span>
                  <span *ngIf="!isProcessing && (!currentSubscription || currentSubscription.plan.id !== plan.id)">
                    {{ currentSubscription ? 'Switch to Plan' : 'Subscribe Now' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Billing Information -->
        <div class="billing-info-section">
          <h2>Billing Information</h2>
          <div class="billing-card">
            <div class="billing-details">
              <div class="detail-item">
                <label>Payment Method</label>
                <span>•••• •••• •••• 4242 (Visa)</span>
                <button type="button" class="btn btn-link">Update</button>
              </div>
              <div class="detail-item">
                <label>Billing Address</label>
                <span>123 Trading St, Finance City, FC 12345</span>
                <button type="button" class="btn btn-link">Update</button>
              </div>
              <div class="detail-item">
                <label>Next Billing Date</label>
                <span *ngIf="currentSubscription">{{ currentSubscription.currentPeriodEnd | date:'mediumDate' }}</span>
                <span *ngIf="!currentSubscription">No active subscription</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .subscription-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #ffffff;
      min-height: calc(100vh - 200px);
    }

    .subscription-header {
      text-align: center;
      margin-bottom: 3rem;

      h1 {
        color: #1e3a8a;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
        font-size: 1.1rem;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #1e3a8a;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

      &.alert-success {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
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

    .subscription-content {
      display: grid;
      gap: 3rem;
    }

    .current-subscription-section,
    .available-plans-section,
    .billing-info-section {
      h2 {
        color: #1e3a8a;
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
      }
    }

    .subscription-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;

      &.active {
        border-color: #16a34a;
        background: #f0fdf4;
      }

      .subscription-header-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h3 {
          color: #1e3a8a;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .subscription-status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;

          &.status-active {
            background: #dcfce7;
            color: #16a34a;
          }

          &.status-trial {
            background: #fef3c7;
            color: #d97706;
          }

          &.status-inactive {
            background: #fee2e2;
            color: #dc2626;
          }
        }
      }

      .subscription-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;

        .detail-item {
          label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.25rem;
          }

          span {
            color: #64748b;
          }

          .cancellation-notice {
            color: #dc2626;
            font-weight: 500;
          }
        }
      }

      .subscription-features {
        margin-bottom: 2rem;

        h4 {
          color: #374151;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            color: #64748b;

            .icon-check {
              color: #16a34a;
            }
          }
        }
      }

      .subscription-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    .no-subscription-card {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;

      .no-subscription-content {
        .no-subscription-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        h3 {
          color: #374151;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        p {
          color: #64748b;
          margin-bottom: 2rem;
        }
      }
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .plan-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      position: relative;
      transition: all 0.2s;

      &:hover {
        border-color: #1e3a8a;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      &.popular {
        border-color: #1e3a8a;
        box-shadow: 0 4px 20px rgba(30, 58, 138, 0.1);

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e3a8a;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }
      }

      .plan-header {
        text-align: center;
        margin-bottom: 2rem;

        h3 {
          color: #1e3a8a;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .plan-price {
          margin-bottom: 1rem;

          .price {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e3a8a;
          }

          .interval {
            color: #64748b;
            font-size: 1rem;
          }
        }

        .plan-description {
          color: #64748b;
          line-height: 1.6;
        }
      }

      .plan-features {
        margin-bottom: 2rem;

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            color: #64748b;

            .icon-check {
              color: #16a34a;
            }
          }
        }
      }
    }

    .billing-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;

      .billing-details {
        display: grid;
        gap: 1.5rem;

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;

          label {
            font-weight: 600;
            color: #374151;
          }

          span {
            color: #64748b;
          }
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

      &.btn-outline {
        background: transparent;
        color: #1e3a8a;
        border-color: #1e3a8a;

        &:hover:not(:disabled) {
          background: #1e3a8a;
          color: white;
        }

        &.btn-danger {
          color: #dc2626;
          border-color: #dc2626;

          &:hover:not(:disabled) {
            background: #dc2626;
            color: white;
          }
        }
      }

      &.btn-link {
        background: none;
        color: #1e3a8a;
        border: none;
        padding: 0.25rem 0.5rem;
        text-decoration: underline;

        &:hover:not(:disabled) {
          color: #1e40af;
        }
      }
    }

    // Icon classes
    .icon-check::before { content: "✅"; }
    .icon-error::before { content: "❌"; }
    .icon-success::before { content: "✅"; }

    @media (max-width: 768px) {
      .subscription-container {
        padding: 1rem;
      }

      .subscription-header h1 {
        font-size: 2rem;
      }

      .plans-grid {
        grid-template-columns: 1fr;
      }

      .subscription-card .subscription-actions {
        flex-direction: column;
      }

      .billing-card .billing-details .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class SubscriptionManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  currentSubscription: Subscription | null = null;
  availablePlans: SubscriptionPlan[] = [];
  showAvailablePlans = false;
  
  loading = false;
  isProcessing = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.loadSubscriptionData();
      this.loadAvailablePlans();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSubscriptionData(): void {
    if (!this.user) return;

    this.loading = true;
    this.error = null;

    this.subscriptionService.getCurrentSubscription(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription) => {
          this.currentSubscription = subscription;
          this.loading = false;
        },
        error: (error) => {
          // No active subscription is not an error
          if (error.message.includes('No active subscription')) {
            this.currentSubscription = null;
          } else {
            this.error = 'Failed to load subscription data: ' + error.message;
          }
          this.loading = false;
        }
      });
  }

  private loadAvailablePlans(): void {
    this.subscriptionService.getAvailablePlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (plans) => {
          this.availablePlans = plans;
        },
        error: (error) => {
          console.error('Failed to load available plans:', error);
        }
      });
  }

  subscribeToPlan(plan: SubscriptionPlan): void {
    if (!this.user) return;

    this.isProcessing = true;
    this.error = null;

    this.subscriptionService.subscribeToPlan(this.user.id, plan.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription) => {
          this.currentSubscription = subscription;
          this.successMessage = `Successfully subscribed to ${plan.name}!`;
          this.isProcessing = false;
          this.showAvailablePlans = false;
          
          // Update user subscription status
          if (this.user) {
            this.user.subscriptionStatus = SubscriptionStatus.ACTIVE;
            this.authService.updateCurrentUser(this.user);
          }
        },
        error: (error) => {
          this.error = 'Failed to subscribe: ' + error.message;
          this.isProcessing = false;
        }
      });
  }

  cancelSubscription(): void {
    if (!this.currentSubscription) return;

    this.isProcessing = true;
    this.error = null;

    this.subscriptionService.cancelSubscription(this.currentSubscription.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription) => {
          this.currentSubscription = subscription;
          this.successMessage = 'Subscription cancelled successfully. You will retain access until the end of your billing period.';
          this.isProcessing = false;
        },
        error: (error) => {
          this.error = 'Failed to cancel subscription: ' + error.message;
          this.isProcessing = false;
        }
      });
  }

  reactivateSubscription(): void {
    if (!this.currentSubscription) return;

    this.isProcessing = true;
    this.error = null;

    this.subscriptionService.reactivateSubscription(this.currentSubscription.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription) => {
          this.currentSubscription = subscription;
          this.successMessage = 'Subscription reactivated successfully!';
          this.isProcessing = false;
        },
        error: (error) => {
          this.error = 'Failed to reactivate subscription: ' + error.message;
          this.isProcessing = false;
        }
      });
  }

  viewBillingHistory(): void {
    // Navigate to billing history page or open modal
    console.log('View billing history');
  }

  getSubscriptionStatusClass(): string {
    if (!this.currentSubscription) return '';
    
    switch (this.currentSubscription.status) {
      case SubscriptionStatus.ACTIVE:
        return 'status-active';
      case SubscriptionStatus.TRIAL:
        return 'status-trial';
      case SubscriptionStatus.INACTIVE:
        return 'status-inactive';
      default:
        return '';
    }
  }

  getSubscriptionStatusLabel(): string {
    if (!this.currentSubscription) return '';
    
    switch (this.currentSubscription.status) {
      case SubscriptionStatus.ACTIVE:
        return this.currentSubscription.cancelAtPeriodEnd ? 'Cancelling' : 'Active';
      case SubscriptionStatus.TRIAL:
        return 'Trial';
      case SubscriptionStatus.INACTIVE:
        return 'Inactive';
      default:
        return '';
    }
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}