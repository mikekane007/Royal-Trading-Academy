import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton"
      [class]="'skeleton-' + type"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="borderRadius"
    >
    </div>
  `,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() type: 'text' | 'circle' | 'rectangle' | 'card' = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() borderRadius?: string;
}