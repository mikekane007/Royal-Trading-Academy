import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-page">
      <div class="error-container">
        <div class="error-illustration">
          <svg viewBox="0 0 200 200" class="error-svg">
            <circle cx="100" cy="100" r="80" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2"/>
            <text x="100" y="110" text-anchor="middle" class="error-number">404</text>
          </svg>
        </div>
        
        <div class="error-content">
          <h1 class="error-title">Page Not Found</h1>
          <p class="error-description">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div class="error-actions">
            <button 
              class="btn btn-primary"
              (click)="goHome()"
            >
              Go to Homepage
            </button>
            
            <button 
              class="btn btn-secondary"
              (click)="goBack()"
            >
              Go Back
            </button>
          </div>
          
          <div class="error-suggestions">
            <h3>What you can do:</h3>
            <ul>
              <li>Check the URL for typos</li>
              <li>Visit our <a routerLink="/">homepage</a></li>
              <li>Browse our <a routerLink="/courses">courses</a></li>
              <li>Contact our <a href="mailto:support&#64;royaltradingacademy.com">support team</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  
  goHome(): void {
    window.location.href = '/';
  }

  goBack(): void {
    window.history.back();
  }
}