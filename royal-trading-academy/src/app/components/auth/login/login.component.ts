import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, LoginRequest } from '../../../services/auth/auth.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { FormValidationService } from '../../../services/validation/form-validation.service';
import { SanitizationService } from '../../../services/security/sanitization.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormFieldComponent, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';
  showPassword = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    public validationService: FormValidationService,
    private sanitizationService: SanitizationService
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [
        Validators.required,
        FormValidationService.emailValidator(),
        FormValidationService.noXssValidator(),
        FormValidationService.noSqlInjectionValidator(),
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        FormValidationService.noXssValidator()
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';

      // Sanitize form data before submission
      const sanitizedFormData = this.validationService.sanitizeFormData(this.loginForm.value);
      
      // Validate for security issues
      const securityValidation = this.validationService.validateFormSecurity(sanitizedFormData);
      if (!securityValidation.isValid) {
        this.errorMessage = 'Invalid input detected. Please check your entries.';
        return;
      }

      const loginData: LoginRequest = {
        email: sanitizedFormData.email.trim().toLowerCase(),
        password: sanitizedFormData.password
      };

      this.authService.login(loginData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Successful login - notification handled by service
              this.router.navigate([this.returnUrl]);
            }
          },
          error: (error) => {
            // Enhanced error handling for security
            if (error.message.includes('locked')) {
              this.errorMessage = error.message;
            } else {
              this.errorMessage = 'Login failed. Please check your credentials.';
            }
            console.error('Login error:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control && control.errors && control.touched) {
      // Check for security-related errors first
      const securityError = this.validationService.getSecurityErrorMessage(controlName, control.errors);
      if (securityError !== this.validationService.getErrorMessage(controlName, control.errors)) {
        return securityError;
      }

      // Standard validation errors
      if (control.errors['required']) {
        return `${this.getFieldDisplayName(controlName)} is required`;
      }
      if (control.errors['invalidEmail']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${this.getFieldDisplayName(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldDisplayName(controlName)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.errors && control.touched);
  }

  /**
   * Get display name for form field
   */
  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    return fieldNames[controlName] || controlName;
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Clear error message when user starts typing
   */
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  /**
   * Check if login is in progress
   */
  get isLoginLoading(): boolean {
    return this.loadingService.getLoadingState('login');
  }

  /**
   * Get form control for template access
   */
  getFormControl(controlName: string) {
    return this.loginForm.get(controlName);
  }
}