import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
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
  { path: '**', redirectTo: '' }
];
