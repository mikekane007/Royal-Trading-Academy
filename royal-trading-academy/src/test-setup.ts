// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Global test configuration
beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset any global state
  if (typeof window !== 'undefined') {
    // Clear any global variables or state
    (window as any).testState = {};
  }
});

// Global error handler for tests
window.addEventListener('error', (event) => {
  console.error('Global test error:', event.error);
});

// Mock IntersectionObserver for tests
if (typeof window !== 'undefined') {
  (window as any).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock ResizeObserver for tests
if (typeof window !== 'undefined') {
  (window as any).ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock matchMedia for tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jasmine.createSpy('matchMedia').and.returnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    }),
  });
}

// Mock CSS.supports for tests
if (typeof CSS !== 'undefined') {
  CSS.supports = CSS.supports || (() => false);
}

// Increase timeout for async tests
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;