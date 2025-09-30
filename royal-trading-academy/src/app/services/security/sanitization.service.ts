import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitize URL to prevent malicious redirects
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(4, url) || '';
  }

  /**
   * Sanitize resource URL for trusted content
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Remove potentially dangerous HTML tags and attributes
   */
  stripHtml(input: string): string {
    if (!input) return '';
    
    // Remove script tags and their content
    let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous event handlers
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: protocols
    cleaned = cleaned.replace(/javascript:/gi, '');
    
    // Remove data: protocols (except for images)
    cleaned = cleaned.replace(/data:(?!image\/)/gi, '');
    
    // Remove HTML tags but keep content
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    return cleaned.trim();
  }

  /**
   * Sanitize user input for safe storage and display
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/data:/gi, '') // Remove data protocols
      .replace(/vbscript:/gi, '') // Remove vbscript protocols
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate and sanitize email addresses
   */
  sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Basic email sanitization
    const sanitized = email.toLowerCase().trim();
    
    // Check for valid email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize phone numbers
   */
  sanitizePhone(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-numeric characters except + at the beginning
    return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  }

  /**
   * Sanitize file names to prevent path traversal
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dots, underscores, hyphens
      .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .substring(0, 255); // Limit length
  }

  /**
   * Encode HTML entities to prevent XSS
   */
  encodeHtmlEntities(input: string): string {
    if (!input) return '';
    
    const entityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    
    return input.replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
  }

  /**
   * Validate and sanitize URLs
   */
  validateUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Block localhost and private IP ranges in production
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        // Allow in development, block in production
        return window.location.hostname === 'localhost';
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize search queries to prevent injection attacks
   */
  sanitizeSearchQuery(query: string): string {
    if (!query) return '';
    
    return query
      .trim()
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 100); // Limit length
  }

  /**
   * Check if content contains potentially malicious patterns
   */
  containsMaliciousContent(content: string): boolean {
    if (!content) return false;
    
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(content));
  }
}