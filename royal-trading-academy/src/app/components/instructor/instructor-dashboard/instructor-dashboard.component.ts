import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course/course.service';
import { AuthService } from '../../../services/auth/auth.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { Course } from '../../../models/course/course.model';

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  pendingApprovals: number;
  completedCourses: number;
}

interface RecentEnrollment {
  id: string;
  studentName: string;
  courseName: string;
  enrolledAt: Date;
  progress: number;
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.scss']
})
export class InstructorDashboardComponent implements OnInit {
  instructorStats: InstructorStats = {
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingApprovals: 0,
    completedCourses: 0
  };

  myCourses: Course[] = [];
  recentEnrollments: RecentEnrollment[] = [];
  isLoading = true;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
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

      // Load instructor's courses and statistics
      await Promise.all([
        this.loadInstructorStats(),
        this.loadMyCourses(),
        this.loadRecentEnrollments()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.notificationService.showError('Failed to load dashboard data');
    } finally {
      this.isLoading = false;
      this.loadingService.setLoading(false);
    }
  }

  private async loadInstructorStats(): Promise<void> {
    // Mock data for development - replace with actual API call
    this.instructorStats = {
      totalCourses: 5,
      totalStudents: 234,
      totalRevenue: 15600,
      averageRating: 4.7,
      pendingApprovals: 2,
      completedCourses: 3
    };
  }

  private async loadMyCourses(): Promise<void> {
    try {
      // Mock data for development - replace with actual API call
      this.myCourses = [
        {
          id: 'course-1',
          title: 'Forex Trading Fundamentals',
          description: 'Learn the basics of forex trading',
          category: 'Forex',
          level: 'beginner',
          duration: 480,
          price: 299,
          rating: 4.8,
          enrollmentCount: 89,
          instructorId: 'instructor-1',
          instructorName: 'Current User',
          thumbnailUrl: '/assets/images/courses/forex-fundamentals.jpg',
          isPublished: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          lessons: []
        },
        {
          id: 'course-2',
          title: 'Advanced Options Strategies',
          description: 'Master complex options trading strategies',
          category: 'Options',
          level: 'advanced',
          duration: 720,
          price: 499,
          rating: 4.6,
          enrollmentCount: 45,
          instructorId: 'instructor-1',
          instructorName: 'Current User',
          thumbnailUrl: '/assets/images/courses/options-advanced.jpg',
          isPublished: false,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          lessons: []
        }
      ];
    } catch (error) {
      console.error('Error loading courses:', error);
      throw error;
    }
  }

  private async loadRecentEnrollments(): Promise<void> {
    // Mock data for development - replace with actual API call
    this.recentEnrollments = [
      {
        id: 'enrollment-1',
        studentName: 'John Smith',
        courseName: 'Forex Trading Fundamentals',
        enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        progress: 15
      },
      {
        id: 'enrollment-2',
        studentName: 'Sarah Johnson',
        courseName: 'Advanced Options Strategies',
        enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        progress: 8
      },
      {
        id: 'enrollment-3',
        studentName: 'Mike Davis',
        courseName: 'Forex Trading Fundamentals',
        enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        progress: 32
      }
    ];
  }

  navigateToCreateCourse(): void {
    // Navigation will be handled by router
  }

  navigateToCourseEditor(courseId: string): void {
    // Navigation will be handled by router
  }

  navigateToAnalytics(): void {
    // Navigation will be handled by router
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getCourseStatusClass(isPublished: boolean): string {
    return isPublished ? 'status-published' : 'status-draft';
  }

  getCourseStatusText(isPublished: boolean): string {
    return isPublished ? 'Published' : 'Draft';
  }

  getProgressBarClass(progress: number): string {
    if (progress < 25) return 'progress-low';
    if (progress < 75) return 'progress-medium';
    return 'progress-high';
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  trackByEnrollmentId(index: number, enrollment: RecentEnrollment): string {
    return enrollment.id;
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}