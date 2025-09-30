import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

/**
 * Common testing utilities and helpers
 */
export class TestUtils {
  /**
   * Get common testing imports for components
   */
  static getCommonTestingImports() {
    return [
      NoopAnimationsModule,
      RouterTestingModule,
      HttpClientTestingModule,
      ReactiveFormsModule,
      FormsModule,
      MatSnackBarModule,
      MatDialogModule
    ];
  }

  /**
   * Find element by test id
   */
  static findByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement | null {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Find all elements by test id
   */
  static findAllByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Click element by test id
   */
  static clickByTestId<T>(fixture: ComponentFixture<T>, testId: string): void {
    const element = this.findByTestId(fixture, testId);
    if (element) {
      element.nativeElement.click();
      fixture.detectChanges();
    }
  }

  /**
   * Set input value by test id
   */
  static setInputValue<T>(fixture: ComponentFixture<T>, testId: string, value: string): void {
    const element = this.findByTestId(fixture, testId);
    if (element) {
      const input = element.nativeElement as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  }

  /**
   * Get text content by test id
   */
  static getTextByTestId<T>(fixture: ComponentFixture<T>, testId: string): string {
    const element = this.findByTestId(fixture, testId);
    return element ? element.nativeElement.textContent.trim() : '';
  }

  /**
   * Wait for async operations
   */
  static async waitForAsync(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Create mock observable that returns value
   */
  static mockObservable<T>(value: T) {
    return of(value);
  }

  /**
   * Create mock observable that throws error
   */
  static mockObservableError(error: any) {
    return throwError(() => error);
  }

  /**
   * Create spy object with methods
   */
  static createSpyObj(baseName: string, methodNames: string[]): jasmine.SpyObj<any> {
    return jasmine.createSpyObj(baseName, methodNames);
  }
}

/**
 * Mock data for testing
 */
export class MockData {
  static user = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    isVerified: true,
    subscriptionStatus: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  static course = {
    id: '1',
    title: 'Forex Trading Mastery',
    description: 'Learn professional forex trading strategies',
    shortDescription: 'Master forex trading',
    price: 299.99,
    currency: 'USD',
    difficulty: 'INTERMEDIATE',
    duration: 40,
    instructor: MockData.user,
    thumbnailUrl: '/assets/images/courses/forex-mastery.svg',
    category: 'Forex',
    tags: ['forex', 'trading', 'finance'],
    isPublished: true,
    enrollmentCount: 150,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  static enrollment = {
    id: '1',
    user: MockData.user,
    course: MockData.course,
    enrolledAt: new Date(),
    progress: 65,
    lastAccessedAt: new Date(),
    certificateIssued: false
  };

  static forumThread = {
    id: '1',
    title: 'Question about risk management',
    content: 'How do I calculate proper position size?',
    author: MockData.user,
    course: MockData.course,
    createdAt: new Date(),
    updatedAt: new Date(),
    replies: [],
    isLocked: false,
    isPinned: false
  };
}

/**
 * Accessibility testing helper
 */
export class AccessibilityTestHelper {
  /**
   * Run axe accessibility tests on component
   */
  static async runAxeTest<T>(fixture: ComponentFixture<T>): Promise<void> {
    const axe = await import('axe-core');
    
    return new Promise((resolve, reject) => {
      axe.run(fixture.nativeElement, (err: Error, results: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (results.violations.length > 0) {
          const violationMessages = results.violations.map((violation: any) => 
            `${violation.id}: ${violation.description}`
          ).join('\n');
          reject(new Error(`Accessibility violations found:\n${violationMessages}`));
        } else {
          resolve();
        }
      });
    });
  }
}