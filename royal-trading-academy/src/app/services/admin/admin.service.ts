import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, async } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_enrollment' | 'course_creation' | 'payment';
  description: string;
  timestamp: Date;
  userId?: string;
  courseId?: string;
}

export interface UserManagement {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  enrollmentCount: number;
}

export interface CourseApproval {
  id: string;
  title: string;
  instructorName: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  description: string;
}

export interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  courseEnrollments: { course: string; enrollments: number }[];
  revenue: { month: string; amount: number }[];
  topInstructors: { name: string; students: number; revenue: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Mock data for development - replace with actual API call
      const mockStats: DashboardStats = {
        totalUsers: 1247,
        totalCourses: 23,
        totalEnrollments: 3456,
        totalRevenue: 125430.50,
        activeUsers: 892,
        pendingApprovals: 5
      };

      this.dashboardStatsSubject.next(mockStats);
      return mockStats;

      // Uncomment when backend is ready:
      // const stats = await this.http.get<DashboardStats>(`${this.apiUrl}/stats`).toPromise();
      // this.dashboardStatsSubject.next(stats);
      // return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Recent Activity
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      // Mock data for development - replace with actual API call
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user John Doe registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          userId: 'user-123'
        },
        {
          id: '2',
          type: 'course_enrollment',
          description: 'Sarah Smith enrolled in Forex Mastery Course',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          userId: 'user-456',
          courseId: 'course-789'
        },
        {
          id: '3',
          type: 'course_creation',
          description: 'New course "Advanced Options Trading" submitted for approval',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          courseId: 'course-101'
        },
        {
          id: '4',
          type: 'payment',
          description: 'Payment of $299 received from Mike Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          userId: 'user-789'
        }
      ];

      return mockActivity;

      // Uncomment when backend is ready:
      // return await this.http.get<RecentActivity[]>(`${this.apiUrl}/activity`).toPromise();
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<{ users: UserManagement[]; total: number }> {
    try {
      const params: any = { page, limit };
      if (search) params.search = search;

      // Mock data for development
      const mockUsers: UserManagement[] = [
        {
          id: 'user-1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          lastLoginAt: new Date('2024-01-20'),
          enrollmentCount: 3
        },
        {
          id: 'user-2',
          email: 'sarah.instructor@example.com',
          firstName: 'Sarah',
          lastName: 'Chen',
          role: 'instructor',
          isActive: true,
          createdAt: new Date('2023-12-01'),
          lastLoginAt: new Date('2024-01-19'),
          enrollmentCount: 0
        }
      ];

      return { users: mockUsers, total: mockUsers.length };

      // Uncomment when backend is ready:
      // return await this.http.get<{ users: UserManagement[]; total: number }>(`${this.apiUrl}/users`, { params }).toPromise();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating user ${userId} role to ${role}`);
      
      // Uncomment when backend is ready:
      // await this.http.put(`${this.apiUrl}/users/${userId}/role`, { role }).toPromise();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Toggling user ${userId} status`);
      
      // Uncomment when backend is ready:
      // await this.http.put(`${this.apiUrl}/users/${userId}/toggle-status`, {}).toPromise();
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  // Course Approval Management
  async getPendingCourses(): Promise<CourseApproval[]> {
    try {
      // Mock data for development
      const mockCourses: CourseApproval[] = [
        {
          id: 'course-1',
          title: 'Advanced Cryptocurrency Trading',
          instructorName: 'Alex Rodriguez',
          submittedAt: new Date('2024-01-18'),
          status: 'pending',
          category: 'Cryptocurrency',
          description: 'Learn advanced crypto trading strategies and risk management techniques.'
        },
        {
          id: 'course-2',
          title: 'Options Trading Masterclass',
          instructorName: 'Michael Sterling',
          submittedAt: new Date('2024-01-17'),
          status: 'pending',
          category: 'Options',
          description: 'Comprehensive guide to options trading for intermediate traders.'
        }
      ];

      return mockCourses;

      // Uncomment when backend is ready:
      // return await this.http.get<CourseApproval[]>(`${this.apiUrl}/courses/pending`).toPromise();
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      throw error;
    }
  }

  async approveCourse(courseId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Approving course ${courseId}`);
      
      // Uncomment when backend is ready:
      // await this.http.put(`${this.apiUrl}/courses/${courseId}/approve`, {}).toPromise();
    } catch (error) {
      console.error('Error approving course:', error);
      throw error;
    }
  }

  async rejectCourse(courseId: string, reason: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Rejecting course ${courseId} with reason: ${reason}`);
      
      // Uncomment when backend is ready:
      // await this.http.put(`${this.apiUrl}/courses/${courseId}/reject`, { reason }).toPromise();
    } catch (error) {
      console.error('Error rejecting course:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // Mock data for development - replace with actual API call
      const mockAnalytics: AnalyticsData = {
        userGrowth: [
          { month: 'Jan', users: 120 },
          { month: 'Feb', users: 180 },
          { month: 'Mar', users: 250 },
          { month: 'Apr', users: 320 },
          { month: 'May', users: 410 },
          { month: 'Jun', users: 520 }
        ],
        courseEnrollments: [
          { course: 'Forex Basics', enrollments: 145 },
          { course: 'Stock Trading 101', enrollments: 98 },
          { course: 'Crypto Fundamentals', enrollments: 87 },
          { course: 'Options Trading', enrollments: 76 },
          { course: 'Risk Management', enrollments: 65 }
        ],
        revenue: [
          { month: 'Jan', amount: 12500 },
          { month: 'Feb', amount: 18900 },
          { month: 'Mar', amount: 25600 },
          { month: 'Apr', amount: 32100 },
          { month: 'May', amount: 41200 },
          { month: 'Jun', amount: 52800 }
        ],
        topInstructors: [
          { name: 'Sarah Chen', students: 234, revenue: 15600 },
          { name: 'Michael Rodriguez', students: 189, revenue: 12400 },
          { name: 'Alex Thompson', students: 156, revenue: 9800 },
          { name: 'Emily Davis', students: 134, revenue: 8900 },
          { name: 'David Wilson', students: 98, revenue: 6700 }
        ]
      };

      return mockAnalytics;

      // Uncomment when backend is ready:
      // return await this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`).toPromise();
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  // Content Moderation
  async moderateContent(contentId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Moderating content ${contentId} with action ${action}`, reason ? `Reason: ${reason}` : '');
      
      // Uncomment when backend is ready:
      // await this.http.put(`${this.apiUrl}/content/${contentId}/moderate`, { action, reason }).toPromise();
    } catch (error) {
      console.error('Error moderating content:', error);
      throw error;
    }
  }

  async getContentReports(): Promise<any[]> {
    try {
      // Mock data for development
      const mockReports = [
        {
          id: 'report-1',
          contentType: 'course',
          contentId: 'course-123',
          contentTitle: 'Suspicious Trading Course',
          reportedBy: 'user-456',
          reason: 'Inappropriate content',
          status: 'pending',
          createdAt: new Date('2024-01-18')
        }
      ];

      return mockReports;

      // Uncomment when backend is ready:
      // return await this.http.get<any[]>(`${this.apiUrl}/content/reports`).toPromise();
    } catch (error) {
      console.error('Error fetching content reports:', error);
      throw error;
    }
  }
}