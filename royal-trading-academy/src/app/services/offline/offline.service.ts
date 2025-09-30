import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private swUpdate = inject(SwUpdate);
  private notificationService = inject(NotificationService);
  
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public online$ = this.onlineSubject.asObservable();
  
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();
  
  constructor() {
    this.initializeOfflineDetection();
    this.initializeServiceWorkerUpdates();
  }
  
  private initializeOfflineDetection() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }
    
    // Monitor online/offline status
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(online => {
      this.onlineSubject.next(online);
      
      if (online) {
        this.notificationService.showSuccess('Connection restored');
      } else {
        this.notificationService.showWarning('You are offline. Some features may be limited.');
      }
    });
  }
  
  private initializeServiceWorkerUpdates() {
    if (this.swUpdate.isEnabled) {
      // Check for updates every 6 hours
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 6 * 60 * 60 * 1000);
      
      // Listen for version updates
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailableSubject.next(true);
          this.notificationService.showInfo(
            'A new version is available. Refresh to update.',
            'Update Available'
          );
        });
    }
  }
  
  public activateUpdate(): Promise<boolean> {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate.activateUpdate().then(() => {
        document.location.reload();
        return true;
      });
    }
    return Promise.resolve(false);
  }
  
  public isOnline(): boolean {
    return this.onlineSubject.value;
  }
  
  // Cache management methods
  public clearCache(): Promise<void> {
    if (typeof window !== 'undefined' && 'caches' in window) {
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        this.notificationService.showSuccess('Cache cleared successfully');
      });
    }
    return Promise.resolve();
  }
  
  public getCacheSize(): Promise<number> {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => {
        return estimate.usage || 0;
      });
    }
    return Promise.resolve(0);
  }
  
  // Offline data management
  public saveOfflineData(key: string, data: any): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }
  
  public getOfflineData(key: string, maxAge: number = 24 * 60 * 60 * 1000): any {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;
        
        if (age < maxAge) {
          return parsed.data;
        } else {
          localStorage.removeItem(`offline_${key}`);
        }
      }
    } catch (error) {
      console.error('Error retrieving offline data:', error);
    }
    return null;
  }
  
  public removeOfflineData(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`offline_${key}`);
    }
  }
}