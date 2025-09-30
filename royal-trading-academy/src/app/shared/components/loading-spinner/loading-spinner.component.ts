import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [class.loading-overlay]="overlay">
      <div class="spinner" [class]="'spinner-' + size">
        <div class="spinner-circle"></div>
      </div>
      <div *ngIf="message" class="loading-message">{{ message }}</div>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message?: string;
  @Input() overlay: boolean = false;
}