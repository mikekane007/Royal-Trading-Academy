import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get loading state', () => {
    service.setLoadingState('test', true);
    expect(service.isLoading('test')).toBeTruthy();

    service.setLoadingState('test', false);
    expect(service.isLoading('test')).toBeFalsy();
  });

  it('should return false for non-existent loading state', () => {
    expect(service.isLoading('nonexistent')).toBeFalsy();
  });

  it('should have observable for loading state', (done) => {
    service.getLoadingState('test').subscribe(isLoading => {
      expect(typeof isLoading).toBe('boolean');
      done();
    });
  });

  it('should clear loading state', () => {
    service.setLoadingState('test', true);
    expect(service.isLoading('test')).toBeTruthy();

    service.clearLoadingState('test');
    expect(service.isLoading('test')).toBeFalsy();
  });

  it('should clear all loading states', () => {
    service.setLoadingState('test1', true);
    service.setLoadingState('test2', true);
    
    expect(service.isLoading('test1')).toBeTruthy();
    expect(service.isLoading('test2')).toBeTruthy();

    service.clearAllLoadingStates();
    
    expect(service.isLoading('test1')).toBeFalsy();
    expect(service.isLoading('test2')).toBeFalsy();
  });
});