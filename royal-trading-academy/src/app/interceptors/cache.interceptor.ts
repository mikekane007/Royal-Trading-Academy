import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { OfflineService } from '../services/offline/offline.service';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  maxAge: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private offlineService = inject(OfflineService);
  
  // Cache configuration for different endpoints
  private cacheConfig = new Map<string, number>([
    ['/api/courses', 5 * 60 * 1000], // 5 minutes
    ['/api/users/profile', 2 * 60 * 1000], // 2 minutes
    ['/api/users/dashboard', 1 * 60 * 1000], // 1 minute
    ['/api/courses/', 10 * 60 * 1000], // 10 minutes for individual courses
  ]);
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    const cacheKey = this.getCacheKey(req);
    const maxAge = this.getCacheMaxAge(req.url);
    
    // If no caching configured for this endpoint, proceed normally
    if (maxAge === 0) {
      return next.handle(req);
    }
    
    // Check if we have a cached response
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      console.log('Serving from cache:', req.url);
      return of(cachedEntry.response);
    }
    
    // If offline, try to serve from cache even if expired
    if (!this.offlineService.isOnline() && cachedEntry) {
      console.log('Serving expired cache (offline):', req.url);
      return of(cachedEntry.response);
    }
    
    // Add cache headers to request
    const cachedRequest = req.clone({
      setHeaders: {
        'Cache-Control': 'max-age=' + Math.floor(maxAge / 1000)
      }
    });
    
    return next.handle(cachedRequest).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Cache successful responses
          if (event.status === 200) {
            this.cache.set(cacheKey, {
              response: event,
              timestamp: Date.now(),
              maxAge
            });
            
            // Also save to offline storage for critical data
            if (this.isCriticalEndpoint(req.url)) {
              this.offlineService.saveOfflineData(cacheKey, event.body);
            }
          }
        }
      })
    );
  }
  
  private getCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.urlWithParams}`;
  }
  
  private getCacheMaxAge(url: string): number {
    for (const [pattern, maxAge] of this.cacheConfig.entries()) {
      if (url.includes(pattern)) {
        return maxAge;
      }
    }
    return 0; // No caching by default
  }
  
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.maxAge;
  }
  
  private isCriticalEndpoint(url: string): boolean {
    const criticalEndpoints = ['/api/users/profile', '/api/users/dashboard'];
    return criticalEndpoints.some(endpoint => url.includes(endpoint));
  }
  
  public clearCache(): void {
    this.cache.clear();
    console.log('HTTP cache cleared');
  }
  
  public getCacheSize(): number {
    return this.cache.size;
  }
  
  public getCacheStats(): any {
    const stats = {
      totalEntries: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        maxAge: entry.maxAge,
        valid: this.isCacheValid(entry)
      }))
    };
    return stats;
  }
}