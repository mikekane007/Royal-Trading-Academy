import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private performanceObserver?: PerformanceObserver;
  
  constructor() {
    this.initializePerformanceMonitoring();
  }
  
  private initializePerformanceMonitoring() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.logPerformanceEntry(entry);
        }
      });
      
      // Observe different types of performance entries
      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }
  
  private logPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'navigation':
        this.logNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.logResourceTiming(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.logPaintTiming(entry);
        break;
    }
  }
  
  private logNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart,
      domInteractive: entry.domInteractive - entry.fetchStart
    };
    
    console.log('Navigation Timing:', metrics);
    
    // Send to analytics if needed
    this.sendAnalytics('navigation', metrics);
  }
  
  private logResourceTiming(entry: PerformanceResourceTiming) {
    // Log slow resources (> 1 second)
    if (entry.duration > 1000) {
      console.warn('Slow resource detected:', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize
      });
    }
  }
  
  private logPaintTiming(entry: PerformanceEntry) {
    console.log(`${entry.name}: ${entry.startTime}ms`);
  }
  
  private sendAnalytics(type: string, data: any) {
    // Implement analytics sending logic here
    // This could be Google Analytics, custom analytics, etc.
  }
  
  // Lazy loading utilities
  public lazyLoadImage(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (img.complete) {
        resolve();
        return;
      }
      
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load'));
      
      // Set loading attribute for native lazy loading
      img.loading = 'lazy';
    });
  }
  
  // Bundle analysis utilities
  public measureBundleSize(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && resource.transferSize
      );
      
      const totalJSSize = jsResources.reduce((total, resource) => 
        total + (resource.transferSize || 0), 0
      );
      
      console.log('JavaScript Bundle Analysis:', {
        totalSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
        fileCount: jsResources.length,
        files: jsResources.map(r => ({
          name: r.name.split('/').pop(),
          size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`
        }))
      });
    }
  }
  
  // Memory usage monitoring
  public monitorMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
  
  // Critical Resource Hints
  public preloadCriticalResources(resources: string[]): void {
    if (typeof document === 'undefined') return;
    
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }
  
  // Prefetch next page resources
  public prefetchResources(resources: string[]): void {
    if (typeof document === 'undefined') return;
    
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }
  
  public disconnect(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}