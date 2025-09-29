import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnrolledCourse } from '../../../models/enrollment/enrollment.model';
import { ProgressCircleComponent } from '../progress-circle/progress-circle.component';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ProgressCircleComponent],
  template: `
    <div class="course-card" [class.completed]="enrolledCourse.enrollment.progress === 100">
      <div class="course-thumbnail">
        <img 
          [src]="enrolledCourse.course.thumbnailUrl" 
          [alt]="enrolledCourse.course.title"
          (error)="onImageError($event)"
        />
        <div class="progress-overlay">
          <app-progress-circle 
            [progress]="enrolledCourse.enrollment.progress"
            [size]="60"
            [strokeWidth]="4"
            [color]="getProgressColor()"
          />
        </div>
      </div>
      
      <div class="course-content">
        <h3 class="course-title">{{ enrolledCourse.course.title }}</h3>
        <p class="course-instructor">by {{ enrolledCourse.course.instructor }}</p>
        
        <div class="course-stats">
          <span class="lessons-count">
            {{ getLessonsCompleted() }} / {{ enrolledCourse.course.totalLessons }} lessons
          </span>
          <span class="last-accessed">
            Last accessed {{ getLastAccessedText() }}
          </span>
        </div>

        <div class="course-actions">
          <button 
            class="continue-btn"
            [routerLink]="['/courses', enrolledCourse.course.id]"
            *ngIf="enrolledCourse.enrollment.progress < 100"
          >
            <span *ngIf="enrolledCourse.enrollment.nextLesson">
              Continue: {{ enrolledCourse.enrollment.nextLesson.title }}
            </span>
            <span *ngIf="!enrolledCourse.enrollment.nextLesson">
              Continue Course
            </span>
          </button>
          
          <button 
            class="review-btn"
            [routerLink]="['/courses', enrolledCourse.course.id]"
            *ngIf="enrolledCourse.enrollment.progress === 100"
          >
            Review Course
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      &.completed {
        border-color: #48bb78;
        
        .course-thumbnail::after {
          content: '✓';
          position: absolute;
          top: 8px;
          right: 8px;
          background: #48bb78;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
      }
    }

    .course-thumbnail {
      position: relative;
      height: 160px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .progress-overlay {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        padding: 4px;
        backdrop-filter: blur(4px);
      }
    }

    .course-content {
      padding: 1.5rem;
    }

    .course-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .course-instructor {
      color: #718096;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
    }

    .course-stats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1.5rem;

      .lessons-count {
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
      }

      .last-accessed {
        font-size: 0.75rem;
        color: #a0aec0;
      }
    }

    .course-actions {
      .continue-btn,
      .review-btn {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: block;
        text-align: center;
      }

      .continue-btn {
        background: #667eea;
        color: white;

        &:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }
      }

      .review-btn {
        background: #48bb78;
        color: white;

        &:hover {
          background: #38a169;
          transform: translateY(-1px);
        }
      }
    }

    @media (max-width: 768px) {
      .course-thumbnail {
        height: 120px;
      }

      .course-content {
        padding: 1rem;
      }

      .course-title {
        font-size: 1rem;
      }
    }
  `]
})
export class CourseCardComponent {
  @Input() enrolledCourse!: EnrolledCourse;

  onImageError(event: any): void {
    event.target.src = '/assets/images/course-placeholder.svg';
  }

  getProgressColor(): string {
    const progress = this.enrolledCourse.enrollment.progress;
    if (progress === 100) return '#48bb78'; // Green for completed
    if (progress >= 50) return '#ed8936'; // Orange for in progress
    return '#667eea'; // Blue for just started
  }

  getLessonsCompleted(): number {
    return Math.round((this.enrolledCourse.enrollment.progress / 100) * this.enrolledCourse.course.totalLessons);
  }

  getLastAccessedText(): string {
    const lastAccessed = new Date(this.enrolledCourse.enrollment.lastAccessedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastAccessed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }
}