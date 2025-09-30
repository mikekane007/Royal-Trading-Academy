import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-page">
      <div class="error-container">
        <div class="error-illustration">
          <svg viewBox="0 0 200 200" class="error-svg">
            <circle cx="100" cy="100" r="80" fill="#fef2f2" stroke="#fecaca" stroke-width="2"/>
            <path d="M70 70 L130 130 M130 70 L70 130" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
        
        <div class="error-content">
          <h1 class="error-title">{{ title || 'Something went wrong' }}</h1>
          <p class="error-description">
            {{ message || 'We encountered an unexpected error. Please try again or contact support if the problem persists.' }}
          </p>
          
          <div class="error-details" *ngIf="showDetails && errorDetails">
            <details>
              <summary>Error Details</summary>
              <pre>{{ errorDetails }}</pre>
            </details>
          </div>
          
          <div class="error-actions">
            <button 
              class="btn btn-primary"
              (click)="retry()"
              *ngIf="showRetry"
            >
              Try Again
            </button>
            
            <button 
              class="btn btn-secondary"
              (click)="goHome()"
            >
              Go to Homepage
            </button>
            
            <button 
              class="btn btn-outline"
              (click)="reportError()"
              *ngIf="showReport"
            >
              Report Issue
            </button>
          </div>
          
          <div class="error-help">
            <h3>Need help?</h3>
            <p>
              If this error continues, please contact our support team at 
              <a href="mailto:support&#64;royaltradingacademy.com">support&#64;royaltradingacademy.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  @Input() title?: string;
  @Input() message?: string;
  @Input() errorDetails?: string;
  @Input() showDetails: boolean = false;
  @Input() showRetry: boolean = true;
  @Input() showReport: boolean = true;
  @Input() onRetry?: () => void;

  retry(): void {
    if (this.onRetry) {
      this.onRetry();
    } else {
      window.location.reload();
    }
  }

  goHome(): void {
    window.location.href = '/';
  }

  reportError(): void {
    const subject = encodeURIComponent('Error Report - Royal Trading Academy');
    const body = encodeURIComponent(`
Error Title: ${this.title || 'Unknown Error'}
Error Message: ${this.message || 'No message provided'}
Page URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

${this.errorDetails ? `Error Details:\n${this.errorDetails}` : ''}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:support&#64;royaltradingacademy.com?subject=${subject}&body=${body}`);
  }
}