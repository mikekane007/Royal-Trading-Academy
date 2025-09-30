import { Injectable } from '@angular/core';

export interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // in milliseconds
  secure?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly ENCRYPTION_KEY = 'rta_secure_key_2024';
  private readonly PREFIX = 'rta_';

  constructor() {}

  /**
   * Store data securely with optional encryption and expiry
   */
  setItem(key: string, value: any, options: StorageOptions = {}): void {
    if (!this.isBrowser()) return;

    const data = {
      value: value,
      timestamp: Date.now(),
      expiry: options.expiry ? Date.now() + options.expiry : null,
      encrypted: options.encrypt || false
    };

    let serializedData = JSON.stringify(data);

    if (options.encrypt) {
      serializedData = this.encrypt(serializedData);
    }

    const storageKey = this.PREFIX + key;
    
    try {
      if (options.secure && this.isSecureContext()) {
        // Use sessionStorage for sensitive data in secure contexts
        sessionStorage.setItem(storageKey, serializedData);
      } else {
        localStorage.setItem(storageKey, serializedData);
      }
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  /**
   * Retrieve data from secure storage
   */
  getItem(key: string): any {
    if (!this.isBrowser()) return null;

    const storageKey = this.PREFIX + key;
    let serializedData: string | null = null;

    try {
      // Try sessionStorage first, then localStorage
      serializedData = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }

    if (!serializedData) return null;

    try {
      let data;
      
      // Try to decrypt if it looks encrypted
      if (this.isEncrypted(serializedData)) {
        const decrypted = this.decrypt(serializedData);
        data = JSON.parse(decrypted);
      } else {
        data = JSON.parse(serializedData);
      }

      // Check if data has expired
      if (data.expiry && Date.now() > data.expiry) {
        this.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      this.removeItem(key); // Remove corrupted data
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    if (!this.isBrowser()) return;

    const storageKey = this.PREFIX + key;
    
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }

  /**
   * Clear all app-related storage
   */
  clear(): void {
    if (!this.isBrowser()) return;

    try {
      // Clear localStorage items with our prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage items with our prefix
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Store authentication token securely
   */
  setAuthToken(token: string, refreshToken: string): void {
    this.setItem('auth_token', token, { 
      encrypt: true, 
      secure: true,
      expiry: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    this.setItem('refresh_token', refreshToken, { 
      encrypt: true, 
      secure: true,
      expiry: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return this.getItem('auth_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getItem('refresh_token');
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens(): void {
    this.removeItem('auth_token');
    this.removeItem('refresh_token');
    this.removeItem('current_user');
  }

  /**
   * Store user data securely
   */
  setUserData(user: any): void {
    this.setItem('current_user', user, { 
      encrypt: true,
      secure: true 
    });
  }

  /**
   * Get user data
   */
  getUserData(): any {
    return this.getItem('current_user');
  }

  /**
   * Simple encryption (for basic obfuscation - not cryptographically secure)
   */
  private encrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
      );
    }
    return btoa(result);
  }

  /**
   * Simple decryption
   */
  private decrypt(encryptedText: string): string {
    try {
      const text = atob(encryptedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return result;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Check if data is encrypted
   */
  private isEncrypted(data: string): boolean {
    try {
      // Try to parse as JSON first
      JSON.parse(data);
      return false;
    } catch {
      // If it's not valid JSON, it might be encrypted
      try {
        atob(data);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Check if running in browser
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof Storage !== 'undefined';
  }

  /**
   * Check if running in secure context (HTTPS)
   */
  private isSecureContext(): boolean {
    return this.isBrowser() && (window.isSecureContext || window.location.protocol === 'https:');
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number } {
    if (!this.isBrowser()) {
      return { used: 0, available: 0 };
    }

    try {
      let used = 0;
      
      // Calculate used space
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      });

      // Estimate available space (localStorage typically has 5-10MB limit)
      const available = 5 * 1024 * 1024 - used; // Assume 5MB limit

      return { used, available };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }
}