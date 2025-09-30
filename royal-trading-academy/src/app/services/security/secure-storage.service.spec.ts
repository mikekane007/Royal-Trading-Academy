import { TestBed } from '@angular/core/testing';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService', () => {
  let service: SecureStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureStorageService);
    
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem and getItem', () => {
    it('should store and retrieve simple data', () => {
      const testData = 'test value';
      service.setItem('test-key', testData);
      
      const retrieved = service.getItem('test-key');
      expect(retrieved).toBe(testData);
    });

    it('should store and retrieve complex objects', () => {
      const testData = { name: 'John', age: 30, active: true };
      service.setItem('test-object', testData);
      
      const retrieved = service.getItem('test-object');
      expect(retrieved).toEqual(testData);
    });

    it('should handle encrypted storage', () => {
      const testData = 'sensitive data';
      service.setItem('encrypted-key', testData, { encrypt: true });
      
      const retrieved = service.getItem('encrypted-key');
      expect(retrieved).toBe(testData);
    });

    it('should handle expiry', (done) => {
      const testData = 'expiring data';
      service.setItem('expiry-key', testData, { expiry: 100 }); // 100ms expiry
      
      // Should be available immediately
      expect(service.getItem('expiry-key')).toBe(testData);
      
      // Should be expired after 150ms
      setTimeout(() => {
        expect(service.getItem('expiry-key')).toBeNull();
        done();
      }, 150);
    });

    it('should return null for non-existent keys', () => {
      expect(service.getItem('non-existent')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove stored items', () => {
      service.setItem('remove-test', 'test data');
      expect(service.getItem('remove-test')).toBe('test data');
      
      service.removeItem('remove-test');
      expect(service.getItem('remove-test')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all app-related storage', () => {
      service.setItem('test1', 'data1');
      service.setItem('test2', 'data2');
      
      service.clear();
      
      expect(service.getItem('test1')).toBeNull();
      expect(service.getItem('test2')).toBeNull();
    });
  });

  describe('auth token methods', () => {
    it('should store and retrieve auth tokens', () => {
      const token = 'test-token';
      const refreshToken = 'test-refresh-token';
      
      service.setAuthToken(token, refreshToken);
      
      expect(service.getAuthToken()).toBe(token);
      expect(service.getRefreshToken()).toBe(refreshToken);
    });

    it('should clear auth tokens', () => {
      service.setAuthToken('token', 'refresh-token');
      service.setUserData({ id: '1', name: 'Test User' });
      
      service.clearAuthTokens();
      
      expect(service.getAuthToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getUserData()).toBeNull();
    });
  });

  describe('user data methods', () => {
    it('should store and retrieve user data', () => {
      const userData = { id: '1', name: 'John Doe', email: 'john@example.com' };
      
      service.setUserData(userData);
      
      const retrieved = service.getUserData();
      expect(retrieved).toEqual(userData);
    });
  });

  describe('storage info', () => {
    it('should return storage usage information', () => {
      service.setItem('test', 'some data');
      
      const info = service.getStorageInfo();
      expect(info.used).toBeGreaterThan(0);
      expect(info.available).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle corrupted data gracefully', () => {
      // Manually set corrupted data
      localStorage.setItem('rta_corrupted', 'invalid-json');
      
      expect(service.getItem('corrupted')).toBeNull();
    });

    it('should handle storage quota exceeded', () => {
      // This test would need to mock localStorage to throw an error
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      
      expect(() => service.setItem('test', 'data')).not.toThrow();
    });
  });
});