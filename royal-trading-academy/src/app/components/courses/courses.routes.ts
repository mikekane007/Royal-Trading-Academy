import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';

export const coursesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./course-catalog/course-catalog.component').then(m => m.CourseCatalogComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./course-detail/course-detail.component').then(m => m.CourseDetailComponent)
  },
  {
    path: ':id/lesson/:lessonId',
    loadComponent: () => import('./lesson-viewer/lesson-viewer.component').then(m => m.LessonViewerComponent),
    canActivate: [authGuard]
  }
];