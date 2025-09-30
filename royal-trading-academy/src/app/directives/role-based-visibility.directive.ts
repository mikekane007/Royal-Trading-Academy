import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../models/user/user.model';

@Directive({
  selector: '[appRoleBasedVisibility]',
  standalone: true
})
export class RoleBasedVisibilityDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() set appRoleBasedVisibility(roles: UserRole | UserRole[]) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  @Input() appRoleBasedVisibilityElse?: TemplateRef<any>;

  private allowedRoles: UserRole[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;

      // Show else template if provided
      if (this.appRoleBasedVisibilityElse) {
        this.viewContainer.createEmbeddedView(this.appRoleBasedVisibilityElse);
      }
    }
  }

  private checkPermission(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !this.authService.isAuthenticated()) {
      return false;
    }

    // If no specific roles required, just check if authenticated
    if (this.allowedRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    return this.allowedRoles.includes(currentUser.role);
  }
}

// Additional directive for checking specific permissions
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() set appHasPermission(permission: string) {
    this.requiredPermission = permission;
    this.updateView();
  }

  @Input() appHasPermissionElse?: TemplateRef<any>;

  private requiredPermission = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;

      if (this.appHasPermissionElse) {
        this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
      }
    }
  }

  private checkPermission(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !this.authService.isAuthenticated()) {
      return false;
    }

    // Define permission mappings
    const permissions: { [key: string]: UserRole[] } = {
      'view-admin-panel': [UserRole.ADMIN],
      'manage-users': [UserRole.ADMIN],
      'create-course': [UserRole.ADMIN, UserRole.INSTRUCTOR],
      'edit-course': [UserRole.ADMIN, UserRole.INSTRUCTOR],
      'delete-course': [UserRole.ADMIN],
      'moderate-forum': [UserRole.ADMIN, UserRole.INSTRUCTOR],
      'view-analytics': [UserRole.ADMIN, UserRole.INSTRUCTOR],
      'manage-payments': [UserRole.ADMIN],
      'view-profile': [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT],
      'edit-profile': [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT]
    };

    const allowedRoles = permissions[this.requiredPermission];
    
    if (!allowedRoles) {
      console.warn(`Unknown permission: ${this.requiredPermission}`);
      return false;
    }

    return allowedRoles.includes(currentUser.role);
  }
}