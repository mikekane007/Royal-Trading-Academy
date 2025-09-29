import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-circle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-circle" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" class="progress-svg">
        <circle
          class="progress-background"
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
        />
        <circle
          class="progress-bar"
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="strokeDashoffset"
          [style.stroke]="color"
        />
      </svg>
      <div class="progress-text">
        <span class="progress-percentage">{{ progress }}%</span>
        <span class="progress-label" *ngIf="label">{{ label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .progress-circle {
      position: relative;
      display: inline-block;
    }

    .progress-svg {
      transform: rotate(-90deg);
    }

    .progress-background {
      fill: none;
      stroke: #e2e8f0;
    }

    .progress-bar {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease-in-out;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .progress-percentage {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #2d3748;
    }

    .progress-label {
      display: block;
      font-size: 0.75rem;
      color: #718096;
      margin-top: 2px;
    }
  `]
})
export class ProgressCircleComponent {
  @Input() progress: number = 0;
  @Input() size: number = 80;
  @Input() strokeWidth: number = 6;
  @Input() color: string = '#667eea';
  @Input() label?: string;

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get strokeDashoffset(): number {
    return this.circumference - (this.progress / 100) * this.circumference;
  }
}