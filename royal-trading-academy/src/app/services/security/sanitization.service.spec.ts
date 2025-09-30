import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SanitizationService } from './sanitization.service';

describe('SanitizationService', () => {
  let service: SanitizationService;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DomSanitizer', ['sanitize', 'bypassSecurityTrustResourceUrl']);

    TestBed.configureTestingModule({
      providers: [
        SanitizationService,
        { provide: DomSanitizer, useValue: spy }
      ]
    });

    service = TestBed.inject(SanitizationService);
    mockDomSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('stripHtml', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = service.stripHtml(input);
      expect(result).toBe('Hello World');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Hello</div>';
      const result = service.stripHtml(input);
      expect(result).toBe('Hello');
    });

    it('should remove javascript protocols', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = service.stripHtml(input);
      expect(result).toBe('Link');
    });

    it('should handle empty input', () => {
      expect(service.stripHtml('')).toBe('');
      expect(service.stripHtml(null as any)).toBe('');
      expect(service.stripHtml(undefined as any)).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = service.sanitizeInput(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove javascript protocols', () => {
      const input = 'javascript:alert("xss")';
      const result = service.sanitizeInput(input);
      expect(result).not.toContain('javascript:');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = service.sanitizeInput(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeEmail', () => {
    it('should return valid email in lowercase', () => {
      const input = 'TEST@EXAMPLE.COM';
      const result = service.sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should return empty string for invalid email', () => {
      const input = 'invalid-email';
      const result = service.sanitizeEmail(input);
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      expect(service.sanitizeEmail('')).toBe('');
      expect(service.sanitizeEmail(null as any)).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove dangerous characters', () => {
      const input = '../../../etc/passwd';
      const result = service.sanitizeFileName(input);
      expect(result).not.toContain('../');
      expect(result).not.toContain('/');
    });

    it('should allow safe characters', () => {
      const input = 'my-file_name.txt';
      const result = service.sanitizeFileName(input);
      expect(result).toBe('my-file_name.txt');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(300);
      const result = service.sanitizeFileName(input);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('containsMaliciousContent', () => {
    it('should detect script tags', () => {
      const input = '<script>alert("xss")</script>';
      expect(service.containsMaliciousContent(input)).toBe(true);
    });

    it('should detect javascript protocols', () => {
      const input = 'javascript:alert("xss")';
      expect(service.containsMaliciousContent(input)).toBe(true);
    });

    it('should detect event handlers', () => {
      const input = 'onclick="alert(\'xss\')"';
      expect(service.containsMaliciousContent(input)).toBe(true);
    });

    it('should return false for safe content', () => {
      const input = 'Hello World! This is safe content.';
      expect(service.containsMaliciousContent(input)).toBe(false);
    });

    it('should handle empty input', () => {
      expect(service.containsMaliciousContent('')).toBe(false);
      expect(service.containsMaliciousContent(null as any)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      const input = 'https://example.com';
      expect(service.validateUrl(input)).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      const input = 'http://example.com';
      expect(service.validateUrl(input)).toBe(true);
    });

    it('should reject non-HTTP protocols', () => {
      const input = 'ftp://example.com';
      expect(service.validateUrl(input)).toBe(false);
    });

    it('should reject javascript protocols', () => {
      const input = 'javascript:alert("xss")';
      expect(service.validateUrl(input)).toBe(false);
    });

    it('should handle invalid URLs', () => {
      const input = 'not-a-url';
      expect(service.validateUrl(input)).toBe(false);
    });
  });
});