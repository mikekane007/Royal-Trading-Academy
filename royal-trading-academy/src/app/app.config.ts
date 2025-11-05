import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { SecurityInterceptor } from './interceptors/security.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { GlobalErrorHandler } from './services/error/error-handler.service';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: PerformanceInterceptor,
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: CacheInterceptor,
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: SecurityInterceptor,
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptor,
        multi: true
    },
    {
        provide: ErrorHandler,
        useClass: GlobalErrorHandler
    },
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })
]
};
