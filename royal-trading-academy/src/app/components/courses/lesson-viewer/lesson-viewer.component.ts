import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../services/course/course.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="lesson-viewer" *ngIf="!loading && lesson">
      <div class="video-container">
        <video 
          #videoPlayer
          [src]="lesson.videoUrl" 
          controls
          (timeupdate)="onTimeUpdate($event)"
          (ended)="onVideoEnded()">
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div class="lesson-content">
        <div class="container">
          <h1>{{ lesson.title }}</h1>
          <p class="description">{{ lesson.description }}</p>
          
          <div class="lesson-resources" *ngIf="lesson.resources?.length">
            <h3>Resources</h3>
            <ul>
              <li *ngFor="let resource of lesson.resources">
                <a [href]="resource.url" target="_blank" rel="noopener">
                  {{ resource.title }}
                </a>
              </li>
            </ul>
          </div>
          
          <div class="lesson-notes">
            <h3>Notes</h3>
            <textarea 
              [(ngModel)]="notes" 
              (blur)="saveNotes()"
              placeholder="Take notes while watching..."
              rows="6">
            </textarea>
          </div>
        </div>
      </div>
    </div>
    
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
  `,
  styles: [`
    .lesson-viewer {
      min-height: 100vh;
    }
    
    .video-container {
      background: #000;
      position: relative;
    }
    
    video {
      width: 100%;
      height: 60vh;
      object-fit: contain;
    }
    
    .lesson-content {
      padding: 2rem 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    .description {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    
    .lesson-resources,
    .lesson-notes {
      margin-bottom: 2rem;
    }
    
    .lesson-resources h3,
    .lesson-notes h3 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    .lesson-resources ul {
      list-style: none;
      padding: 0;
    }
    
    .lesson-resources li {
      margin-bottom: 0.5rem;
    }
    
    .lesson-resources a {
      color: var(--primary-color);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color);
      border-radius: 4px;
      display: inline-block;
      transition: all 0.3s;
    }
    
    .lesson-resources a:hover {
      background: var(--primary-color);
      color: white;
    }
    
    textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-family: inherit;
      resize: vertical;
    }
  `]
})
export class LessonViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  
  lesson: any = null;
  loading = true;
  notes = '';
  
  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    const lessonId = this.route.snapshot.paramMap.get('lessonId');
    
    if (courseId && lessonId) {
      this.loadLesson(courseId, lessonId);
    }
  }
  
  private loadLesson(courseId: string, lessonId: string) {
    this.courseService.getLesson(courseId, lessonId).subscribe({
      next: (lesson) => {
        this.lesson = lesson;
        this.loading = false;
        this.loadNotes();
      },
      error: (error) => {
        console.error('Error loading lesson:', error);
        this.loading = false;
      }
    });
  }
  
  private loadNotes() {
    // Load saved notes from local storage or API
    const savedNotes = localStorage.getItem(`lesson-notes-${this.lesson.id}`);
    if (savedNotes) {
      this.notes = savedNotes;
    }
  }
  
  saveNotes() {
    if (this.lesson) {
      localStorage.setItem(`lesson-notes-${this.lesson.id}`, this.notes);
    }
  }
  
  onTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    const progress = (video.currentTime / video.duration) * 100;
    
    // Update progress in the backend
    if (this.lesson) {
      this.courseService.updateLessonProgress(this.lesson.id, progress).subscribe();
    }
  }
  
  onVideoEnded() {
    // Mark lesson as completed
    if (this.lesson) {
      this.courseService.markLessonCompleted(this.lesson.id).subscribe();
    }
  }
}