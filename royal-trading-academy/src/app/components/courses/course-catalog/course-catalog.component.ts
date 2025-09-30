import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course/course.service';
import { Course } from '../../../models/course/course.model';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="course-catalog">
      <div class="container">
        <h1>Trading Courses</h1>
        <p class="subtitle">Master the art of trading with our comprehensive courses</p>
        
        <div class="filters">
          <select (change)="filterByCategory($event)" class="filter-select">
            <option value="">All Categories</option>
            <option value="forex">Forex</option>
            <option value="stocks">Stocks</option>
            <option value="crypto">Cryptocurrency</option>
            <option value="options">Options</option>
          </select>
          
          <select (change)="filterByLevel($event)" class="filter-select">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <app-loading-spinner *ngIf="loading"></app-loading-spinner>
        
        <div class="courses-grid" *ngIf="!loading">
          <div 
            *ngFor="let course of filteredCourses" 
            class="course-item">
            <h3>{{ course.title }}</h3>
            <p>{{ course.shortDescription }}</p>
            <p>Level: {{ course.level }}</p>
            <p>Price: \${{ course.price }}</p>
            <button [routerLink]="['/courses', course.id]">View Details</button>
          </div>
        </div>
        
        <div *ngIf="!loading && filteredCourses.length === 0" class="no-courses">
          <p>No courses found matching your criteria.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-catalog {
      padding: 2rem 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }
    
    .subtitle {
      text-align: center;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }
    
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      justify-content: center;
    }
    
    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: white;
    }
    
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .course-item {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
    
    .course-item:hover {
      transform: translateY(-2px);
    }
    
    .course-item h3 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }
    
    .course-item button {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    
    .no-courses {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
  `]
})
export class CourseCatalogComponent implements OnInit {
  private courseService = inject(CourseService);
  
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = true;
  
  ngOnInit() {
    this.loadCourses();
  }
  
  private loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }
  
  filterByCategory(event: Event) {
    const category = (event.target as HTMLSelectElement).value;
    this.applyFilters(category, null);
  }
  
  filterByLevel(event: Event) {
    const level = (event.target as HTMLSelectElement).value;
    this.applyFilters(null, level);
  }
  
  private applyFilters(category: string | null, level: string | null) {
    this.filteredCourses = this.courses.filter(course => {
      const categoryMatch = !category || course.category === category;
      const levelMatch = !level || course.level === level;
      return categoryMatch && levelMatch;
    });
  }
}