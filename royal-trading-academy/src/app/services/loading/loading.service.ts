import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingStates = new Map<string, boolean>();

  constructor() {}

  // Global loading state
  isLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // Named loading states for specific operations
  setLoadingState(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
    this.updateGlobalLoading();
  }

  getLoadingState(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  isLoadingState(key: string): Observable<boolean> {
    return new BehaviorSubject(this.getLoadingState(key)).asObservable();
  }

  private updateGlobalLoading(): void {
    const hasAnyLoading = Array.from(this.loadingStates.values()).some(loading => loading);
    this.loadingSubject.next(hasAnyLoading);
  }

  // Utility method to wrap async operations with loading state
  async withLoading<T>(operation: () => Promise<T>, loadingKey?: string): Promise<T> {
    try {
      if (loadingKey) {
        this.setLoadingState(loadingKey, true);
      } else {
        this.setLoading(true);
      }
      
      return await operation();
    } finally {
      if (loadingKey) {
        this.setLoadingState(loadingKey, false);
      } else {
        this.setLoading(false);
      }
    }
  }
}