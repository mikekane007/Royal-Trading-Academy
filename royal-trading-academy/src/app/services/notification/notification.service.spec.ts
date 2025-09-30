import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success notification', () => {
    spyOn(service, 'showSuccess').and.callThrough();
    service.showSuccess('Test success message');
    expect(service.showSuccess).toHaveBeenCalledWith('Test success message');
  });

  it('should show error notification', () => {
    spyOn(service, 'showError').and.callThrough();
    service.showError('Test error message');
    expect(service.showError).toHaveBeenCalledWith('Test error message');
  });

  it('should show info notification', () => {
    spyOn(service, 'showInfo').and.callThrough();
    service.showInfo('Test info message');
    expect(service.showInfo).toHaveBeenCalledWith('Test info message');
  });

  it('should show warning notification', () => {
    spyOn(service, 'showWarning').and.callThrough();
    service.showWarning('Test warning message');
    expect(service.showWarning).toHaveBeenCalledWith('Test warning message');
  });
});