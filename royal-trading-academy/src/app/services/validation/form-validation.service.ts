import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  // Custom validators
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = emailRegex.test(control.value);
      
      return valid ? null : { invalidEmail: { value: control.value } };
    };
  }

  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      // Minimum 8 characters
      if (password.length < 8) {
        errors['minLength'] = { requiredLength: 8, actualLength: password.length };
      }

      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors['uppercase'] = true;
      }

      // At least one lowercase letter
      if (!/[a-z]/.test(password)) {
        errors['lowercase'] = true;
      }

      // At least one number
      if (!/\d/.test(password)) {
        errors['number'] = true;
      }

      // At least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors['specialChar'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static confirmPasswordValidator(passwordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordControlName);
      const confirmPassword = control;

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // Basic phone number validation (can be enhanced for specific formats)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const valid = phoneRegex.test(control.value.replace(/[\s\-\(\)]/g, ''));

      return valid ? null : { invalidPhone: { value: control.value } };
    };
  }

  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        new URL(control.value);
        return null;
      } catch {
        return { invalidUrl: { value: control.value } };
      }
    };
  }

  static minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age - 1 } };
      }

      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  // Error message generator
  getErrorMessage(controlName: string, errors: ValidationErrors): string {
    if (errors['required']) {
      return `${this.formatFieldName(controlName)} is required.`;
    }

    if (errors['invalidEmail']) {
      return 'Please enter a valid email address.';
    }

    if (errors['minLength']) {
      return `${this.formatFieldName(controlName)} must be at least ${errors['minLength'].requiredLength} characters long.`;
    }

    if (errors['maxLength']) {
      return `${this.formatFieldName(controlName)} cannot exceed ${errors['maxLength'].requiredLength} characters.`;
    }

    if (errors['min']) {
      return `${this.formatFieldName(controlName)} must be at least ${errors['min'].min}.`;
    }

    if (errors['max']) {
      return `${this.formatFieldName(controlName)} cannot exceed ${errors['max'].max}.`;
    }

    if (errors['uppercase']) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (errors['lowercase']) {
      return 'Password must contain at least one lowercase letter.';
    }

    if (errors['number']) {
      return 'Password must contain at least one number.';
    }

    if (errors['specialChar']) {
      return 'Password must contain at least one special character.';
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    if (errors['invalidPhone']) {
      return 'Please enter a valid phone number.';
    }

    if (errors['invalidUrl']) {
      return 'Please enter a valid URL.';
    }

    if (errors['minAge']) {
      return `You must be at least ${errors['minAge'].requiredAge} years old.`;
    }

    // Default error message
    return `${this.formatFieldName(controlName)} is invalid.`;
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Utility method to check if form control has specific error
  hasError(control: AbstractControl | null, errorType: string): boolean {
    return !!(control && control.errors && control.errors[errorType] && (control.dirty || control.touched));
  }

  // Utility method to get first error message for a control
  getFirstErrorMessage(controlName: string, control: AbstractControl | null): string | null {
    if (!control || !control.errors || (!control.dirty && !control.touched)) {
      return null;
    }

    return this.getErrorMessage(controlName, control.errors);
  }
}