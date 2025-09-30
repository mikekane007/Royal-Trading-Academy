import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SanitizationService } from '../security/sanitization.service';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(private sanitizationService: SanitizationService) {}

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

  // Security-focused validators

  /**
   * Validator to prevent XSS attacks in text inputs
   */
  static noXssValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString();
      
      // Check for potentially malicious patterns
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /eval\s*\(/i,
        /expression\s*\(/i
      ];

      const containsMalicious = maliciousPatterns.some(pattern => pattern.test(value));
      
      return containsMalicious ? { xssDetected: true } : null;
    };
  }

  /**
   * Validator to prevent SQL injection patterns
   */
  static noSqlInjectionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().toLowerCase();
      
      // Common SQL injection patterns
      const sqlPatterns = [
        /(\b(select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
        /(union\s+select)/i,
        /(\bor\b\s+\d+\s*=\s*\d+)/i,
        /(\band\b\s+\d+\s*=\s*\d+)/i,
        /(--|\#|\/\*|\*\/)/,
        /(\bxp_cmdshell\b)/i
      ];

      const containsSql = sqlPatterns.some(pattern => pattern.test(value));
      
      return containsSql ? { sqlInjectionDetected: true } : null;
    };
  }

  /**
   * Validator for secure file names
   */
  static secureFileNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const fileName = control.value.toString();
      
      // Check for path traversal attempts
      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return { pathTraversalDetected: true };
      }

      // Check for dangerous file extensions
      const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.aspx', '.jsp', '.sh', '.ps1', '.py', '.rb'
      ];

      const hasDangerousExtension = dangerousExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext)
      );

      if (hasDangerousExtension) {
        return { dangerousFileType: true };
      }

      // Check for valid characters only
      const validFileNamePattern = /^[a-zA-Z0-9._-]+$/;
      if (!validFileNamePattern.test(fileName)) {
        return { invalidFileName: true };
      }

      return null;
    };
  }

  /**
   * Validator for strong passwords with security requirements
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      // Minimum 12 characters for strong security
      if (password.length < 12) {
        errors['minLength'] = { requiredLength: 12, actualLength: password.length };
      }

      // Maximum length to prevent DoS attacks
      if (password.length > 128) {
        errors['maxLength'] = { maxLength: 128, actualLength: password.length };
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

      // No common patterns
      const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /admin/i,
        /letmein/i,
        /welcome/i,
        /monkey/i,
        /dragon/i
      ];

      if (commonPatterns.some(pattern => pattern.test(password))) {
        errors['commonPattern'] = true;
      }

      // No repeated characters (more than 3 in a row)
      if (/(.)\1{3,}/.test(password)) {
        errors['repeatedChars'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validator for secure URLs
   */
  static secureUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        const url = new URL(control.value);
        
        // Only allow HTTPS in production
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          return { invalidProtocol: true };
        }

        // Block localhost and private IPs in production
        const hostname = url.hostname.toLowerCase();
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')) {
          
          // Allow in development
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            return { privateNetwork: true };
          }
        }

        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  /**
   * Enhanced error message generator with security messages
   */
  getSecurityErrorMessage(controlName: string, errors: ValidationErrors): string {
    if (errors['xssDetected']) {
      return 'Input contains potentially dangerous content. Please remove any script tags or JavaScript.';
    }

    if (errors['sqlInjectionDetected']) {
      return 'Input contains potentially dangerous SQL patterns. Please use only alphanumeric characters.';
    }

    if (errors['pathTraversalDetected']) {
      return 'File name cannot contain path traversal characters (.. / \\).';
    }

    if (errors['dangerousFileType']) {
      return 'This file type is not allowed for security reasons.';
    }

    if (errors['invalidFileName']) {
      return 'File name can only contain letters, numbers, dots, underscores, and hyphens.';
    }

    if (errors['commonPattern']) {
      return 'Password contains common patterns. Please choose a more unique password.';
    }

    if (errors['repeatedChars']) {
      return 'Password cannot contain more than 3 repeated characters in a row.';
    }

    if (errors['invalidProtocol']) {
      return 'Only HTTP and HTTPS URLs are allowed.';
    }

    if (errors['privateNetwork']) {
      return 'URLs pointing to private networks are not allowed.';
    }

    // Fall back to regular error messages
    return this.getErrorMessage(controlName, errors);
  }

  /**
   * Sanitize form data before submission
   */
  sanitizeFormData(formData: any): any {
    const sanitized: any = {};

    Object.keys(formData).forEach(key => {
      const value = formData[key];
      
      if (typeof value === 'string') {
        // Sanitize string inputs
        sanitized[key] = this.sanitizationService.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeFormData(value);
      } else {
        // Keep other types as-is
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Validate form data for security issues
   */
  validateFormSecurity(formData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const checkValue = (value: any, path: string) => {
      if (typeof value === 'string') {
        if (this.sanitizationService.containsMaliciousContent(value)) {
          errors.push(`${path} contains potentially malicious content`);
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(key => {
          checkValue(value[key], `${path}.${key}`);
        });
      }
    };

    Object.keys(formData).forEach(key => {
      checkValue(formData[key], key);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}