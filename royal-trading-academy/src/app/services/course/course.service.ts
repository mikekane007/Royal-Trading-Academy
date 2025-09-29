import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Course, CourseCategory, Difficulty } from '../../models/course/course.model';
import { 
  StudentDashboard, 
  EnrolledCourse, 
  Activity, 
  Achievement, 
  ActivityType, 
  AchievementCategory 
} from '../../models/enrollment/enrollment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all courses
  getCourses(): Observable<Course[]> {
    // For now, return mock data. In production, this would be:
    // return this.http.get<Course[]>(`${this.apiUrl}/courses`);
    return of(this.getMockCourses());
  }

  // Get course by ID
  getCourse(id: string): Observable<Course> {
    // For now, return mock data. In production, this would be:
    // return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
    const course = this.getMockCourses().find(c => c.id === id);
    return of(course!);
  }

  // Get student dashboard data
  getStudentDashboard(userId: string): Observable<StudentDashboard> {
    // For now, return mock data. In production, this would be:
    // return this.http.get<StudentDashboard>(`${this.apiUrl}/users/${userId}/dashboard`);
    return of(this.getMockDashboardData());
  }

  // Enroll in a course
  enrollInCourse(courseId: string): Observable<any> {
    // For now, return mock success. In production, this would be:
    // return this.http.post(`${this.apiUrl}/courses/${courseId}/enroll`, {});
    return of({ success: true });
  }

  // Mock data for development
  private getMockCourses(): Course[] {
    return [
      {
        id: '1',
        title: 'Forex Trading Mastery',
        description: 'Complete guide to forex trading from beginner to advanced level',
        shortDescription: 'Master forex trading with professional strategies',
        price: 299,
        currency: 'USD',
        difficulty: Difficulty.INTERMEDIATE,
        duration: 40,
        instructor: {
          id: '1',
          name: 'Michael Sterling',
          bio: 'Professional forex trader with 15+ years experience',
          profileImage: '/assets/images/instructors/michael-sterling.svg',
          credentials: ['CFA', 'FRM'],
          yearsExperience: 15
        },
        thumbnailUrl: '/assets/images/courses/forex-mastery.svg',
        previewVideoUrl: 'https://example.com/preview1.mp4',
        category: CourseCategory.FOREX,
        tags: ['forex', 'currency', 'trading'],
        isPublished: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-01'),
        enrollmentCount: 1250,
        rating: 4.8,
        lessons: []
      },
      {
        id: '2',
        title: 'Stock Market Strategies',
        description: 'Learn proven stock market strategies for consistent profits',
        shortDescription: 'Professional stock trading strategies',
        price: 399,
        currency: 'USD',
        difficulty: Difficulty.ADVANCED,
        duration: 35,
        instructor: {
          id: '2',
          name: 'Sarah Chen',
          bio: 'Wall Street veteran and portfolio manager',
          profileImage: '/assets/images/instructors/sarah-chen.svg',
          credentials: ['CFA', 'MBA'],
          yearsExperience: 12
        },
        thumbnailUrl: '/assets/images/courses/stock-strategies.svg',
        category: CourseCategory.STOCKS,
        tags: ['stocks', 'equity', 'analysis'],
        isPublished: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-05'),
        enrollmentCount: 890,
        rating: 4.9,
        lessons: []
      },
      {
        id: '3',
        title: 'Cryptocurrency Trading Bootcamp',
        description: 'Complete cryptocurrency trading course covering all major coins',
        shortDescription: 'Master crypto trading and DeFi',
        price: 199,
        currency: 'USD',
        difficulty: Difficulty.BEGINNER,
        duration: 25,
        instructor: {
          id: '3',
          name: 'Alex Rodriguez',
          bio: 'Crypto expert and blockchain consultant',
          profileImage: '/assets/images/instructors/alex-rodriguez.svg',
          credentials: ['Blockchain Certified'],
          yearsExperience: 8
        },
        thumbnailUrl: '/assets/images/courses/crypto-bootcamp.svg',
        category: CourseCategory.CRYPTOCURRENCY,
        tags: ['crypto', 'bitcoin', 'blockchain'],
        isPublished: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-10'),
        enrollmentCount: 2100,
        rating: 4.7,
        lessons: []
      }
    ];
  }

  private getMockDashboardData(): StudentDashboard {
    return {
      user: {
        id: '1',
        name: 'John Doe',
        profileImage: '/assets/images/profile-placeholder.svg'
      },
      enrolledCourses: [
        {
          course: {
            id: '1',
            title: 'Forex Trading Mastery',
            thumbnailUrl: '/assets/images/courses/forex-mastery.svg',
            instructor: 'Michael Sterling',
            totalLessons: 24
          },
          enrollment: {
            progress: 65,
            lastAccessedAt: new Date('2024-02-28'),
            nextLesson: {
              id: '16',
              title: 'Advanced Chart Patterns'
            }
          }
        },
        {
          course: {
            id: '3',
            title: 'Cryptocurrency Trading Bootcamp',
            thumbnailUrl: '/assets/images/courses/crypto-bootcamp.svg',
            instructor: 'Alex Rodriguez',
            totalLessons: 18
          },
          enrollment: {
            progress: 30,
            lastAccessedAt: new Date('2024-02-25'),
            nextLesson: {
              id: '6',
              title: 'Understanding Altcoins'
            }
          }
        },
        {
          course: {
            id: '2',
            title: 'Stock Market Strategies',
            thumbnailUrl: '/assets/images/courses/stock-strategies.svg',
            instructor: 'Sarah Chen',
            totalLessons: 20
          },
          enrollment: {
            progress: 100,
            lastAccessedAt: new Date('2024-02-20'),
            nextLesson: undefined
          }
        }
      ],
      recentActivity: [
        {
          id: '1',
          type: ActivityType.LESSON_COMPLETED,
          description: 'Completed "Risk Management Fundamentals" in Forex Trading Mastery',
          timestamp: new Date('2024-02-28T10:30:00'),
          courseId: '1',
          lessonId: '15'
        },
        {
          id: '2',
          type: ActivityType.CERTIFICATE_EARNED,
          description: 'Earned certificate for Stock Market Strategies',
          timestamp: new Date('2024-02-20T14:15:00'),
          courseId: '2'
        },
        {
          id: '3',
          type: ActivityType.LESSON_COMPLETED,
          description: 'Completed "Bitcoin Fundamentals" in Cryptocurrency Trading Bootcamp',
          timestamp: new Date('2024-02-25T16:45:00'),
          courseId: '3',
          lessonId: '5'
        },
        {
          id: '4',
          type: ActivityType.COURSE_ENROLLED,
          description: 'Enrolled in Forex Trading Mastery',
          timestamp: new Date('2024-02-01T09:00:00'),
          courseId: '1'
        }
      ],
      achievements: [
        {
          id: '1',
          title: 'First Course Completed',
          description: 'Completed your first trading course',
          iconUrl: '/assets/icons/trophy-gold.svg',
          earnedAt: new Date('2024-02-20'),
          category: AchievementCategory.COMPLETION
        },
        {
          id: '2',
          title: 'Quick Learner',
          description: 'Completed 5 lessons in one day',
          iconUrl: '/assets/icons/lightning.svg',
          earnedAt: new Date('2024-02-15'),
          category: AchievementCategory.STREAK
        },
        {
          id: '3',
          title: 'Multi-Asset Trader',
          description: 'Enrolled in courses covering 3 different asset classes',
          iconUrl: '/assets/icons/star-badge.svg',
          earnedAt: new Date('2024-02-10'),
          category: AchievementCategory.MILESTONE
        }
      ],
      overallProgress: {
        totalCourses: 3,
        completedCourses: 1,
        totalHours: 100,
        completedHours: 55
      }
    };
  }
}