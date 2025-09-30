import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  { 
    path: 'verify-email', 
    loadComponent: () => import('./components/auth/email-verification/email-verification.component').then(m => m.EmailVerificationComponent)
  },
  // Protected routes
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'subscription', 
    loadComponent: () => import('./components/subscription/subscription-management/subscription-management.component').then(m => m.SubscriptionManagementComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'delete-account', 
    loadComponent: () => import('./components/profile/account-deletion/account-deletion.component').then(m => m.AccountDeletionComponent),
    canActivate: [authGuard]
  },
  // Forum routes
  { 
    path: 'forum', 
    loadComponent: () => import('./components/forum/forum.component').then(m => m.ForumComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'forum/thread/:id', 
    loadComponent: () => import('./components/forum/thread-detail/thread-detail.component').then(m => m.ThreadDetailComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'forum/notifications', 
    loadComponent: () => import('./components/forum/notifications/forum-notifications.component').then(m => m.ForumNotificationsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'forum/moderation', 
    loadComponent: () => import('./components/forum/moderation/forum-moderation.component').then(m => m.ForumModerationComponent),
    canActivate: [authGuard]
  },
  // Course routes
  { 
    path: 'courses', 
    loadComponent: () => import('./components/courses/course-catalog/course-catalog.component').then(m => m.CourseCatalogComponent)
  },
  { 
    path: 'courses/:id', 
    loadComponent: () => import('./components/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
  },
  { 
    path: 'courses/:id/lesson/:lessonId', 
    loadComponent: () => import('./components/courses/lesson-viewer/lesson-viewer.component').then(m => m.LessonViewerComponent),
    canActivate: [authGuard]
  },
  // Error pages
  { 
    path: 'error', 
    loadComponent: () => import('./components/error/error-page/error-page.component').then(m => m.ErrorPageComponent)
  },
  { 
    path: '404', 
    loadComponent: () => import('./components/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { 
    path: '**', 
    loadComponent: () => import('./components/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
