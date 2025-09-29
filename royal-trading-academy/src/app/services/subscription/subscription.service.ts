import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SubscriptionStatus } from '../../models/user/user.model';

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

export interface SubscriptionResponse {
  success: boolean;
  subscription: Subscription;
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  plans: SubscriptionPlan[];
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly API_URL = 'http://localhost:8080/api/subscriptions'; // TODO: Move to environment

  constructor(private http: HttpClient) {}

  /**
   * Get available subscription plans
   */
  getAvailablePlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<PlansResponse>(`${this.API_URL}/plans`)
      .pipe(
        map(response => response.plans || this.getMockPlans()),
        catchError(() => {
          // Return mock data if API fails
          return [this.getMockPlans()];
        })
      );
  }

  /**
   * Get current user subscription
   */
  getCurrentSubscription(userId: string): Observable<Subscription | null> {
    return this.http.get<SubscriptionResponse>(`${this.API_URL}/user/${userId}`)
      .pipe(
        map(response => response.subscription),
        catchError(error => {
          if (error.status === 404) {
            return [null]; // No active subscription
          }
          return this.handleError(error);
        })
      );
  }

  /**
   * Subscribe to a plan
   */
  subscribeToPlan(userId: string, planId: string): Observable<Subscription> {
    return this.http.post<SubscriptionResponse>(`${this.API_URL}/subscribe`, {
      userId,
      planId
    })
      .pipe(
        map(response => response.subscription),
        catchError(this.handleError)
      );
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: string): Observable<Subscription> {
    return this.http.post<SubscriptionResponse>(`${this.API_URL}/${subscriptionId}/cancel`, {})
      .pipe(
        map(response => response.subscription),
        catchError(this.handleError)
      );
  }

  /**
   * Reactivate subscription
   */
  reactivateSubscription(subscriptionId: string): Observable<Subscription> {
    return this.http.post<SubscriptionResponse>(`${this.API_URL}/${subscriptionId}/reactivate`, {})
      .pipe(
        map(response => response.subscription),
        catchError(this.handleError)
      );
  }

  /**
   * Update subscription plan
   */
  updateSubscriptionPlan(subscriptionId: string, newPlanId: string): Observable<Subscription> {
    return this.http.put<SubscriptionResponse>(`${this.API_URL}/${subscriptionId}/plan`, {
      planId: newPlanId
    })
      .pipe(
        map(response => response.subscription),
        catchError(this.handleError)
      );
  }

  /**
   * Get billing history
   */
  getBillingHistory(userId: string): Observable<any[]> {
    return this.http.get<{ success: boolean; history: any[] }>(`${this.API_URL}/user/${userId}/billing-history`)
      .pipe(
        map(response => response.history),
        catchError(this.handleError)
      );
  }

  /**
   * Get mock plans for development/fallback
   */
  private getMockPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic-monthly',
        name: 'Basic Plan',
        description: 'Perfect for beginners starting their trading journey',
        price: 29,
        currency: 'USD',
        interval: 'month',
        features: [
          'Access to 5 beginner courses',
          'Basic trading tools',
          'Community forum access',
          'Email support',
          'Mobile app access'
        ]
      },
      {
        id: 'pro-monthly',
        name: 'Pro Plan',
        description: 'Ideal for serious traders looking to advance their skills',
        price: 79,
        currency: 'USD',
        interval: 'month',
        isPopular: true,
        features: [
          'Access to all courses (50+)',
          'Advanced trading tools & indicators',
          'Live trading sessions',
          'Priority support',
          'Mobile app access',
          'Downloadable resources',
          'Trading journal templates',
          'Market analysis reports'
        ]
      },
      {
        id: 'premium-monthly',
        name: 'Premium Plan',
        description: 'Complete trading education with personal mentorship',
        price: 149,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Pro Plan',
          '1-on-1 mentorship sessions',
          'Custom trading strategies',
          'Portfolio review & feedback',
          'VIP community access',
          'Early access to new content',
          'Personal trading coach',
          'Advanced market insights'
        ]
      },
      {
        id: 'pro-yearly',
        name: 'Pro Plan (Yearly)',
        description: 'Save 20% with annual billing',
        price: 63,
        currency: 'USD',
        interval: 'year',
        features: [
          'Access to all courses (50+)',
          'Advanced trading tools & indicators',
          'Live trading sessions',
          'Priority support',
          'Mobile app access',
          'Downloadable resources',
          'Trading journal templates',
          'Market analysis reports',
          '2 months free (20% savings)'
        ]
      }
    ];
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

    console.error('Subscription Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}