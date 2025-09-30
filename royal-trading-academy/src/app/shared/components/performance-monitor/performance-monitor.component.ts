import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceService } from '../../../services/performance/performance.service';
import { OfflineService } from '../../../services/offline/offline.service';
import { CacheInterceptor } from '../../../interceptors/cache.interceptor';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-monitor" *ngIf="showMonitor">
      <div class="monitor-header">
        <h4>Performance Monitor</h4>
        <button (click)="toggleMonitor()" class="toggle-btn">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
      
      <div class="monitor-content" *ngIf="expanded">
        <div class="metric-group">
          <h5>Connection Status</h5>
          <div class="metric">
            <span class="label">Status:</span>
            <span [class]="online ? 'online' : 'offline'">
              {{ online ? 'Online' : 'Offline' }}
            </span>
          </div>
        </div>
        
        <div class="metric-group">
          <h5>Cache Statistics</h5>
          <div class="metric">
            <span class="label">Cached Entries:</span>
            <span>{{ cacheStats.totalEntries }}</span>
          </div>
          <div class="metric">
            <span class="label">Cache Size:</span>
            <span>{{ formatBytes(cacheSize) }}</span>
          </div>
        </div>
        
        <div class="metric-group">
          <h5>Performance Metrics</h5>
          <div class="metric">
            <span class="label">Memory Usage:</span>
            <span>{{ formatBytes(memoryUsage) }}</span>
          </div>
          <div class="metric">
            <span class="label">Bundle Size:</span>
            <span>{{ formatBytes(bundleSize) }}</span>
          </div>
        </div>
        
        <div class="actions">
          <button (click)="clearCache()" class="action-btn">Clear Cache</button>
          <button (click)="refreshMetrics()" class="action-btn">Refresh</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-monitor {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.875rem;
      max-width: 300px;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }
    
    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .monitor-header h4 {
      margin: 0;
      font-size: 1rem;
    }
    
    .toggle-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .metric-group {
      margin-bottom: 1rem;
    }
    
    .metric-group h5 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #ffd700;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }
    
    .label {
      color: #ccc;
    }
    
    .online {
      color: #48bb78;
    }
    
    .offline {
      color: #f56565;
    }
    
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .action-btn {
      background: #667eea;
      border: none;
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      flex: 1;
    }
    
    .action-btn:hover {
      background: #5a67d8;
    }
    
    @media (max-width: 768px) {
      .performance-monitor {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  private performanceService = inject(PerformanceService);
  private offlineService = inject(OfflineService);
  
  showMonitor = false;
  expanded = false;
  online = true;
  cacheStats: any = { totalEntries: 0 };
  cacheSize = 0;
  memoryUsage = 0;
  bundleSize = 0;
  
  private updateInterval?: number;
  
  ngOnInit() {
    // Only show in development mode
    this.showMonitor = !this.isProduction();
    
    if (this.showMonitor) {
      this.subscribeToOfflineStatus();
      this.startPerformanceMonitoring();
      this.refreshMetrics();
    }
  }
  
  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.performanceService.disconnect();
  }
  
  private isProduction(): boolean {
    if (typeof window === 'undefined') return true;
    return window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('dev');
  }
  
  private subscribeToOfflineStatus() {
    this.offlineService.online$.subscribe(online => {
      this.online = online;
    });
  }
  
  private startPerformanceMonitoring() {
    this.updateInterval = window.setInterval(() => {
      this.refreshMetrics();
    }, 5000); // Update every 5 seconds
  }
  
  refreshMetrics() {
    // Update cache statistics
    this.updateCacheStats();
    
    // Update memory usage
    this.performanceService.monitorMemoryUsage();
    this.updateMemoryUsage();
    
    // Update bundle size
    this.performanceService.measureBundleSize();
  }
  
  private updateCacheStats() {
    // This would need to be implemented in the cache interceptor
    // For now, we'll use mock data
    this.cacheStats = {
      totalEntries: Math.floor(Math.random() * 50) + 10
    };
  }
  
  private async updateMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize;
    }
    
    this.cacheSize = await this.offlineService.getCacheSize();
  }
  
  toggleMonitor() {
    this.expanded = !this.expanded;
  }
  
  async clearCache() {
    await this.offlineService.clearCache();
    this.refreshMetrics();
  }
  
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}