import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { User, UserProfile, TradingExperience, SubscriptionStatus } from '../../models/user/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  userProfile: UserProfile | null = null;
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  isEditingProfile = false;
  isChangingPassword = false;
  isUploadingImage = false;
  
  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;
  
  tradingExperienceOptions = Object.values(TradingExperience);
  subscriptionStatusLabels = {
    [SubscriptionStatus.ACTIVE]: 'Active',
    [SubscriptionStatus.INACTIVE]: 'Inactive',
    [SubscriptionStatus.TRIAL]: 'Trial'
  };
  
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      phone: [''],
      country: [''],
      timezone: [''],
      tradingExperience: [''],
      interests: [[]]
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadUserData(): void {
    this.loading = true;
    this.error = null;
    
    // Get current user from auth service
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      // Load user profile data
      this.userService.getUserProfile(this.user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile: UserProfile) => {
            this.userProfile = profile;
            this.populateProfileForm();
            this.loading = false;
          },
          error: (error: any) => {
            this.error = 'Failed to load profile data: ' + error.message;
            this.loading = false;
          }
        });
    } else {
      this.error = 'User not found';
      this.loading = false;
    }
  }

  private populateProfileForm(): void {
    if (this.user && this.userProfile) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        bio: this.userProfile.bio || '',
        phone: this.userProfile.phone || '',
        country: this.userProfile.country || '',
        timezone: this.userProfile.timezone || '',
        tradingExperience: this.userProfile.tradingExperience || '',
        interests: this.userProfile.interests || []
      });
    }
  }

  onEditProfile(): void {
    this.isEditingProfile = true;
    this.error = null;
    this.successMessage = null;
  }

  onCancelEdit(): void {
    this.isEditingProfile = false;
    this.populateProfileForm();
    this.error = null;
    this.successMessage = null;
  }

  onSaveProfile(): void {
    if (this.profileForm.valid && this.user) {
      this.loading = true;
      this.error = null;
      
      const formValue = this.profileForm.value;
      
      const updateData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        profile: {
          bio: formValue.bio,
          phone: formValue.phone,
          country: formValue.country,
          timezone: formValue.timezone,
          tradingExperience: formValue.tradingExperience,
          interests: formValue.interests
        }
      };

      this.userService.updateUserProfile(this.user.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUser: any) => {
            this.user = updatedUser.user;
            this.userProfile = updatedUser.profile;
            this.isEditingProfile = false;
            this.successMessage = 'Profile updated successfully';
            this.loading = false;
            
            // Update user in auth service
            if (this.user) {
              this.authService.updateCurrentUser(this.user);
            }
          },
          error: (error: any) => {
            this.error = 'Failed to update profile: ' + error.message;
            this.loading = false;
          }
        });
    }
  }

  onChangePassword(): void {
    this.isChangingPassword = true;
    this.error = null;
    this.successMessage = null;
  }

  onCancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordForm.reset();
    this.error = null;
    this.successMessage = null;
  }

  onSavePassword(): void {
    if (this.passwordForm.valid && this.user) {
      this.loading = true;
      this.error = null;
      
      const formValue = this.passwordForm.value;
      
      this.userService.changePassword(this.user.id, {
        currentPassword: formValue.currentPassword,
        newPassword: formValue.newPassword
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isChangingPassword = false;
            this.passwordForm.reset();
            this.successMessage = 'Password changed successfully';
            this.loading = false;
          },
          error: (error: any) => {
            this.error = 'Failed to change password: ' + error.message;
            this.loading = false;
          }
        });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select a valid image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image size must be less than 5MB';
        return;
      }
      
      this.profileImageFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      this.error = null;
    }
  }

  onUploadImage(): void {
    if (this.profileImageFile && this.user) {
      this.isUploadingImage = true;
      this.error = null;
      
      this.userService.uploadProfileImage(this.user.id, this.profileImageFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (this.user) {
              this.user.profileImage = response.imageUrl;
              this.authService.updateCurrentUser(this.user);
            }
            this.profileImageFile = null;
            this.profileImagePreview = null;
            this.successMessage = 'Profile image updated successfully';
            this.isUploadingImage = false;
          },
          error: (error: any) => {
            this.error = 'Failed to upload image: ' + error.message;
            this.isUploadingImage = false;
          }
        });
    }
  }

  onCancelImageUpload(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
    this.error = null;
  }

  onResendVerificationEmail(): void {
    if (this.user) {
      this.loading = true;
      this.error = null;
      
      this.userService.resendVerificationEmail(this.user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Verification email sent successfully';
            this.loading = false;
          },
          error: (error: any) => {
            this.error = 'Failed to send verification email: ' + error.message;
            this.loading = false;
          }
        });
    }
  }

  getSubscriptionStatusClass(): string {
    if (!this.user) return '';
    
    switch (this.user.subscriptionStatus) {
      case SubscriptionStatus.ACTIVE:
        return 'status-active';
      case SubscriptionStatus.TRIAL:
        return 'status-trial';
      case SubscriptionStatus.INACTIVE:
        return 'status-inactive';
      default:
        return '';
    }
  }

  getFieldError(formName: 'profile' | 'password', fieldName: string): string | null {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors?.['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password'
    };
    
    return labels[fieldName] || fieldName;
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}