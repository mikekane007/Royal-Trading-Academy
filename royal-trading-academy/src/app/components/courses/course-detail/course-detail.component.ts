import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course/course.service';
import { Course } from '../../../models/course/course.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  
  course: Course | null = null;
  loading = true;
  
  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
  }
  
  private loadCourse(id: string) {
    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.loading = false;
      }
    });
  }
  
  enrollInCourse() {
    if (this.course) {
      this.courseService.enrollInCourse(this.course.id).subscribe({
        next: () => {
          // Handle successful enrollment
          console.log('Enrolled successfully');
        },
        error: (error) => {
          console.error('Enrollment error:', error);
        }
      });
    }
  }
}