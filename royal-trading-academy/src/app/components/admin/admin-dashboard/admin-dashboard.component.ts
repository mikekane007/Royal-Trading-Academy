import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';
import { UserService } from '../../../services/user/user.service';
import { CourseService } from '../../../services/course/course.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { NotificationService } from '../../../services/notification/notification.service';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_enrollment' | 'course_creation' | 'payment';
  description: string;
  timestamp: Date;
  userId?: string;
  courseId?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0
  };

  recentActivity: RecentActivity[] = [];
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private courseService: CourseService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingService.setLoading(true);

      // Load dashboard statistics
      const [stats, activity] = await Promise.all([
        this.adminService.getDashboardStats(),
        this.adminService.getRecentActivity()
      ]);

      this.stats = stats;
      this.recentActivity = activity;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.notificationService.showError('Failed to load dashboard data');
    } finally {
      this.isLoading = false;
      this.loadingService.setLoading(false);
    }
  }

  navigateToUserManagement(): void {
    // Navigation will be handled by router
  }

  navigateToCourseManagement(): void {
    // Navigation will be handled by router
  }

  navigateToAnalytics(): void {
    // Navigation will be handled by router
  }

  navigateToContentModeration(): void {
    // Navigation will be handled by router
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_registration':
        return 'person_add';
      case 'course_enrollment':
        return 'school';
      case 'course_creation':
        return 'add_circle';
      case 'payment':
        return 'payment';
      default:
        return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user_registration':
        return 'text-blue-600';
      case 'course_enrollment':
        return 'text-green-600';
      case 'course_creation':
        return 'text-purple-600';
      case 'payment':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  trackByActivityId(index: number, activity: RecentActivity): string {
    return activity.id;
  }
}