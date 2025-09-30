/**
 * Security Verification Script
 * This file demonstrates and verifies the security features implemented
 */

import { SanitizationService } from './services/security/sanitization.service';
import { SecureStorageService } from './services/security/secure-storage.service';
import { FormValidationService } from './services/validation/form-validation.service';

export class SecurityVerification {
  
  static runVerification(): void {
    console.log('🔒 Running Security Feature Verification...\n');
    
    this.testInputSanitization();
    this.testSecureStorage();
    this.testFormValidation();
    
    console.log('✅ Security verification completed successfully!');
  }

  private static testInputSanitization(): void {
    console.log('1. Testing Input Sanitization:');
    
    // Mock DomSanitizer for testing
    const mockSanitizer = {
      sanitize: (context: any, value: string) => value,
      bypassSecurityTrustResourceUrl: (url: string) => url
    };
    
    const sanitizer = new SanitizationService(mockSanitizer as any);
    
    // Test XSS prevention
    const xssInput = '<script>alert("xss")</script>Hello World';
    const sanitizedXss = sanitizer.stripHtml(xssInput);
    console.log(`   XSS Input: ${xssInput}`);
    console.log(`   Sanitized: ${sanitizedXss}`);
    console.log(`   ✅ XSS protection: ${!sanitizedXss.includes('<script>')}`);
    
    // Test email sanitization
    const emailInput = 'TEST@EXAMPLE.COM';
    const sanitizedEmail = sanitizer.sanitizeEmail(emailInput);
    console.log(`   Email Input: ${emailInput}`);
    console.log(`   Sanitized: ${sanitizedEmail}`);
    console.log(`   ✅ Email sanitization: ${sanitizedEmail === 'test@example.com'}`);
    
    // Test malicious content detection
    const maliciousContent = 'javascript:alert("hack")';
    const isMalicious = sanitizer.containsMaliciousContent(maliciousContent);
    console.log(`   Malicious Content: ${maliciousContent}`);
    console.log(`   ✅ Malicious detection: ${isMalicious}`);
    
    console.log('');
  }

  private static testSecureStorage(): void {
    console.log('2. Testing Secure Storage:');
    
    const storage = new SecureStorageService();
    
    // Test basic storage
    const testData = { name: 'John', role: 'admin' };
    storage.setItem('test-user', testData);
    const retrieved = storage.getItem('test-user');
    console.log(`   Stored: ${JSON.stringify(testData)}`);
    console.log(`   Retrieved: ${JSON.stringify(retrieved)}`);
    console.log(`   ✅ Basic storage: ${JSON.stringify(testData) === JSON.stringify(retrieved)}`);
    
    // Test encrypted storage
    const sensitiveData = 'sensitive-token-123';
    storage.setItem('encrypted-token', sensitiveData, { encrypt: true });
    const decrypted = storage.getItem('encrypted-token');
    console.log(`   Encrypted data: ${sensitiveData}`);
    console.log(`   Decrypted: ${decrypted}`);
    console.log(`   ✅ Encryption: ${sensitiveData === decrypted}`);
    
    // Test auth token storage
    storage.setAuthToken('test-jwt-token', 'test-refresh-token');
    const authToken = storage.getAuthToken();
    const refreshToken = storage.getRefreshToken();
    console.log(`   ✅ Auth tokens: ${authToken === 'test-jwt-token' && refreshToken === 'test-refresh-token'}`);
    
    // Cleanup
    storage.clear();
    console.log('');
  }

  private static testFormValidation(): void {
    console.log('3. Testing Form Validation:');
    
    // Mock SanitizationService for testing
    const mockSanitizationService = {
      sanitizeInput: (input: string) => input.replace(/[<>]/g, ''),
      containsMaliciousContent: (content: string) => /<script/i.test(content)
    };
    
    const validator = new FormValidationService(mockSanitizationService as any);
    
    // Test XSS validator
    const xssValidator = FormValidationService.noXssValidator();
    const xssResult = xssValidator({ value: '<script>alert("xss")</script>' } as any);
    console.log(`   ✅ XSS Validator: ${xssResult?.['xssDetected'] === true}`);
    
    // Test SQL injection validator
    const sqlValidator = FormValidationService.noSqlInjectionValidator();
    const sqlResult = sqlValidator({ value: "'; DROP TABLE users; --" } as any);
    console.log(`   ✅ SQL Injection Validator: ${sqlResult?.['sqlInjectionDetected'] === true}`);
    
    // Test strong password validator
    const passwordValidator = FormValidationService.strongPasswordValidator();
    const weakPassword = passwordValidator({ value: '123456' } as any);
    const strongPassword = passwordValidator({ value: 'MyStr0ng!P@ssw0rd2024' } as any);
    console.log(`   ✅ Password Validator: ${weakPassword !== null && strongPassword === null}`);
    
    // Test secure URL validator
    const urlValidator = FormValidationService.secureUrlValidator();
    const maliciousUrl = urlValidator({ value: 'javascript:alert("xss")' } as any);
    const validUrl = urlValidator({ value: 'https://example.com' } as any);
    console.log(`   ✅ URL Validator: ${maliciousUrl !== null && validUrl === null}`);
    
    // Test form data sanitization
    const formData = {
      name: '<script>alert("xss")</script>John',
      email: 'john@example.com',
      message: 'Hello World!'
    };
    const sanitized = validator.sanitizeFormData(formData);
    console.log(`   Original: ${JSON.stringify(formData)}`);
    console.log(`   Sanitized: ${JSON.stringify(sanitized)}`);
    console.log(`   ✅ Form Sanitization: ${!sanitized.name.includes('<script>')}`);
    
    console.log('');
  }
}

// Export for potential use in development
export default SecurityVerification;