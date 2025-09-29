import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { CourseService } from '../../services/course/course.service';
import { User } from '../../models/user/user.model';
import { StudentDashboard } from '../../models/enrollment/enrollment.model';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { ActivityFeedComponent } from '../../shared/components/activity-feed/activity-feed.component';
import { AchievementsComponent } from '../../shared/components/achievements/achievements.component';
import { ProgressCircleComponent } from '../../shared/components/progress-circle/progress-circle.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CourseCardComponent, 
    ActivityFeedComponent, 
    AchievementsComponent,
    ProgressCircleComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dashboardData: StudentDashboard | null = null;
  isLoading = true;
  error: string | null = null;
  selectedTab: 'in-progress' | 'completed' | 'not-started' = 'in-progress';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          if (user) {
            this.loadStudentDashboard(user.id);
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.error = 'Failed to load user information';
          this.isLoading = false;
        }
      });
  }

  private loadStudentDashboard(userId: string): void {
    this.courseService.getStudentDashboard(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Failed to load dashboard data';
          this.isLoading = false;
        }
      });
  }

  get inProgressCourses() {
    return this.dashboardData?.enrolledCourses.filter(course => 
      course.enrollment.progress > 0 && course.enrollment.progress < 100
    ) || [];
  }

  get completedCourses() {
    return this.dashboardData?.enrolledCourses.filter(course => 
      course.enrollment.progress === 100
    ) || [];
  }

  get notStartedCourses() {
    return this.dashboardData?.enrolledCourses.filter(course => 
      course.enrollment.progress === 0
    ) || [];
  }

  get nextLessons() {
    return this.inProgressCourses
      .filter(course => course.enrollment.nextLesson)
      .slice(0, 3); // Show only top 3 next lessons
  }

  logout(): void {
    this.isLoading = true;
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          // AuthService will handle navigation
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Logout error:', error);
          // Even if logout fails, clear local data and navigate
        }
      });
  }

  retryLoad(): void {
    if (this.currentUser) {
      this.loadDashboardData();
    }
  }

  getCoursesForTab() {
    switch (this.selectedTab) {
      case 'in-progress':
        return this.inProgressCourses;
      case 'completed':
        return this.completedCourses;
      case 'not-started':
        return this.notStartedCourses;
      default:
        return [];
    }
  }

  trackByCourseId(index: number, course: any): string {
    return course.course.id;
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target.src.includes('profile-placeholder')) {
      return; // Already showing placeholder
    }
    if (target.src.includes('course-placeholder')) {
      return; // Already showing placeholder
    }
    
    // Set appropriate placeholder based on context
    if (target.alt && target.alt.includes('profile')) {
      target.src = '/assets/images/profile-placeholder.svg';
    } else {
      target.src = '/assets/images/course-placeholder.svg';
    }
  }
}