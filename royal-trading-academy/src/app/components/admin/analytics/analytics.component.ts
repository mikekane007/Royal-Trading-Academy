import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AnalyticsData } from '../../../services/admin/admin.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  analyticsData: AnalyticsData | null = null;
  isLoading = true;
  selectedTimeRange = '6months';

  timeRanges = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  async loadAnalyticsData(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingService.setLoading(true);

      this.analyticsData = await this.adminService.getAnalyticsData();
    } catch (error) {
      console.error('Error loading analytics data:', error);
      this.notificationService.showError('Failed to load analytics data');
    } finally {
      this.isLoading = false;
      this.loadingService.setLoading(false);
    }
  }

  onTimeRangeChange(): void {
    this.loadAnalyticsData();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getMaxValue(data: any[], key: string): number {
    return Math.max(...data.map(item => item[key]));
  }

  getBarWidth(value: number, maxValue: number): number {
    return (value / maxValue) * 100;
  }

  exportData(): void {
    // Mock implementation - replace with actual export functionality
    this.notificationService.showSuccess('Analytics data exported successfully');
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }
}