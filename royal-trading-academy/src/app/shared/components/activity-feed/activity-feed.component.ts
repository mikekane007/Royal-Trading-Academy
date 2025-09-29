import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity, ActivityType } from '../../../models/enrollment/enrollment.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-feed">
      <h3 class="feed-title">Recent Activity</h3>
      
      <div class="activity-list" *ngIf="activities.length > 0; else noActivity">
        <div 
          class="activity-item" 
          *ngFor="let activity of activities; trackBy: trackByActivityId"
          [class]="'activity-' + activity.type.toLowerCase()"
        >
          <div class="activity-icon">
            <span [innerHTML]="getActivityIcon(activity.type)"></span>
          </div>
          
          <div class="activity-content">
            <p class="activity-description">{{ activity.description }}</p>
            <span class="activity-time">{{ getTimeAgo(activity.timestamp) }}</span>
          </div>
        </div>
      </div>

      <ng-template #noActivity>
        <div class="no-activity">
          <p>No recent activity to show.</p>
          <p class="suggestion">Start learning to see your progress here!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .activity-feed {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .feed-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 1.5rem 0;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: #f7fafc;
      transition: background-color 0.2s ease;

      &:hover {
        background: #edf2f7;
      }

      &.activity-lesson_completed {
        border-left: 4px solid #48bb78;
      }

      &.activity-course_enrolled {
        border-left: 4px solid #667eea;
      }

      &.activity-course_completed {
        border-left: 4px solid #ed8936;
      }

      &.activity-certificate_earned {
        border-left: 4px solid #f6ad55;
      }

      &.activity-forum_post {
        border-left: 4px solid #9f7aea;
      }
    }

    .activity-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      
      .activity-lesson_completed & {
        background: #48bb78;
      }

      .activity-course_enrolled & {
        background: #667eea;
      }

      .activity-course_completed & {
        background: #ed8936;
      }

      .activity-certificate_earned & {
        background: #f6ad55;
      }

      .activity-forum_post & {
        background: #9f7aea;
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-description {
      font-size: 0.875rem;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
      line-height: 1.4;
    }

    .activity-time {
      font-size: 0.75rem;
      color: #a0aec0;
    }

    .no-activity {
      text-align: center;
      padding: 2rem;
      color: #718096;

      p {
        margin: 0 0 0.5rem 0;
      }

      .suggestion {
        font-size: 0.875rem;
        color: #a0aec0;
      }
    }

    @media (max-width: 768px) {
      .activity-feed {
        padding: 1rem;
      }

      .activity-item {
        padding: 0.75rem;
        gap: 0.75rem;
      }

      .activity-icon {
        width: 28px;
        height: 28px;
        font-size: 14px;
      }
    }
  `]
})
export class ActivityFeedComponent {
  @Input() activities: Activity[] = [];

  trackByActivityId(index: number, activity: Activity): string {
    return activity.id;
  }

  getActivityIcon(type: ActivityType): string {
    switch (type) {
      case ActivityType.LESSON_COMPLETED:
        return '✓';
      case ActivityType.COURSE_ENROLLED:
        return '📚';
      case ActivityType.COURSE_COMPLETED:
        return '🎓';
      case ActivityType.CERTIFICATE_EARNED:
        return '🏆';
      case ActivityType.FORUM_POST:
        return '💬';
      default:
        return '•';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(timestamp).getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }
}