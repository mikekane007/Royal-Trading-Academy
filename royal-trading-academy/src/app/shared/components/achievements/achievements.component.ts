import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement, AchievementCategory } from '../../../models/enrollment/enrollment.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="achievements-section">
      <h3 class="achievements-title">Achievements</h3>
      
      <div class="achievements-grid" *ngIf="achievements.length > 0; else noAchievements">
        <div 
          class="achievement-item" 
          *ngFor="let achievement of achievements; trackBy: trackByAchievementId"
          [class]="'category-' + achievement.category.toLowerCase()"
          [title]="achievement.description"
        >
          <div class="achievement-icon">
            <span [innerHTML]="getAchievementIcon(achievement.category)"></span>
          </div>
          
          <div class="achievement-content">
            <h4 class="achievement-title">{{ achievement.title }}</h4>
            <p class="achievement-description">{{ achievement.description }}</p>
            <span class="achievement-date">{{ getEarnedDateText(achievement.earnedAt) }}</span>
          </div>
        </div>
      </div>

      <ng-template #noAchievements>
        <div class="no-achievements">
          <p>No achievements yet.</p>
          <p class="suggestion">Complete lessons and courses to earn achievements!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .achievements-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .achievements-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 1.5rem 0;
    }

    .achievements-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr;
    }

    .achievement-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: #f7fafc;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        background: #edf2f7;
        transform: translateY(-1px);
      }

      &.category-completion {
        border-color: #48bb78;
        
        .achievement-icon {
          background: #48bb78;
        }
      }

      &.category-engagement {
        border-color: #667eea;
        
        .achievement-icon {
          background: #667eea;
        }
      }

      &.category-streak {
        border-color: #ed8936;
        
        .achievement-icon {
          background: #ed8936;
        }
      }

      &.category-milestone {
        border-color: #f6ad55;
        
        .achievement-icon {
          background: #f6ad55;
        }
      }
    }

    .achievement-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .achievement-content {
      flex: 1;
      min-width: 0;
    }

    .achievement-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 0.25rem 0;
    }

    .achievement-description {
      font-size: 0.875rem;
      color: #4a5568;
      margin: 0 0 0.25rem 0;
      line-height: 1.4;
    }

    .achievement-date {
      font-size: 0.75rem;
      color: #a0aec0;
    }

    .no-achievements {
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
      .achievements-section {
        padding: 1rem;
      }

      .achievement-item {
        padding: 0.75rem;
        gap: 0.75rem;
      }

      .achievement-icon {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }

      .achievement-title {
        font-size: 0.875rem;
      }

      .achievement-description {
        font-size: 0.75rem;
      }
    }

    @media (min-width: 768px) {
      .achievements-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
    }
  `]
})
export class AchievementsComponent {
  @Input() achievements: Achievement[] = [];

  trackByAchievementId(index: number, achievement: Achievement): string {
    return achievement.id;
  }

  getAchievementIcon(category: AchievementCategory): string {
    switch (category) {
      case AchievementCategory.COMPLETION:
        return '🏆';
      case AchievementCategory.ENGAGEMENT:
        return '⭐';
      case AchievementCategory.STREAK:
        return '⚡';
      case AchievementCategory.MILESTONE:
        return '🎯';
      default:
        return '🏅';
    }
  }

  getEarnedDateText(earnedAt: Date): string {
    const date = new Date(earnedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Earned yesterday';
    if (diffDays < 7) return `Earned ${diffDays} days ago`;
    if (diffDays < 30) return `Earned ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Earned on ${date.toLocaleDateString()}`;
  }
}