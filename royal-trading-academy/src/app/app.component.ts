import { Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { ToastNotificationComponent } from './shared/components/toast-notification/toast-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, ToastNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Royal Trading Academy';
}
