import { Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { ToastNotificationComponent } from './shared/components/toast-notification/toast-notification.component';
import { PerformanceMonitorComponent } from './shared/components/performance-monitor/performance-monitor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, ToastNotificationComponent, PerformanceMonitorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Royal Trading Academy';
}
