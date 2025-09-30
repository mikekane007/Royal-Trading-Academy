import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoadingService } from '../loading/loading.service';
import { NotificationService } from '../notification/notification.service';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const loadingSpyObj = jasmine.createSpyObj('LoadingService', ['setLoadingState']);
    const notificationSpyObj = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj },
        { provide: LoadingService, useValue: loadingSpyObj },
        { provide: NotificationService, useValue: notificationSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loadingServiceSpy = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated when no token', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should return null for getCurrentUser when no user in storage', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return null for getToken when no token in storage', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return null for getRefreshToken when no refresh token in storage', () => {
    expect(service.getRefreshToken()).toBeNull();
  });

  it('should check if user has admin role', () => {
    expect(service.isAdmin()).toBeFalsy();
  });

  it('should check if user has instructor role', () => {
    expect(service.isInstructor()).toBeFalsy();
  });

  it('should update current user', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT' as any,
      isVerified: true,
      subscriptionStatus: 'ACTIVE' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    service.updateCurrentUser(mockUser);
    expect(service.getCurrentUser()).toEqual(mockUser);
  });

  it('should have observables for authentication state', (done) => {
    service.isAuthenticated$.subscribe(isAuth => {
      expect(typeof isAuth).toBe('boolean');
      done();
    });
  });

  it('should have observables for current user', (done) => {
    service.currentUser$.subscribe(user => {
      expect(user).toBeNull(); // Initially null
      done();
    });
  });
});