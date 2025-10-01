import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course/course.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { Course, Lesson } from '../../../models/course/course.model';

interface LessonForm {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-editor.component.html',
  styleUrls: ['./course-editor.component.scss']
})
export class CourseEditorComponent implements OnInit {
  courseForm: FormGroup;
  courseId: string | null = null;
  isEditMode = false;
  isLoading = true;
  isSaving = false;
  activeTab = 'basic';

  categories = [
    'Forex',
    'Stocks',
    'Options',
    'Cryptocurrency',
    'Commodities',
    'Bonds',
    'ETFs',
    'Risk Management'
  ];

  levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.courseId;

    if (this.isEditMode) {
      this.loadCourse();
    } else {
      this.isLoading = false;
    }
  }

  private createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      level: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      thumbnailUrl: [''],
      prerequisites: [''],
      learningObjectives: this.fb.array([]),
      lessons: this.fb.array([])
    });
  }

  private async loadCourse(): Promise<void> {
    if (!this.courseId) return;

    try {
      this.isLoading = true;
      this.loadingService.setLoading(true);

      const course = await this.courseService.getCourseById(this.courseId);
      this.populateForm(course);
    } catch (error) {
      console.error('Error loading course:', error);
      this.notificationService.showError('Failed to load course');
      this.router.navigate(['/instructor/dashboard']);
    } finally {
      this.isLoading = false;
      this.loadingService.setLoading(false);
    }
  }

  private populateForm(course: Course): void {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl,
      prerequisites: course.prerequisites || '',
    });

    // Populate learning objectives
    const objectivesArray = this.courseForm.get('learningObjectives') as FormArray;
    if (course.learningObjectives) {
      course.learningObjectives.forEach(objective => {
        objectivesArray.push(this.fb.control(objective, Validators.required));
      });
    }

    // Populate lessons
    const lessonsArray = this.courseForm.get('lessons') as FormArray;
    if (course.lessons) {
      course.lessons.forEach(lesson => {
        lessonsArray.push(this.createLessonFormGroup(lesson));
      });
    }
  }

  private createLessonFormGroup(lesson?: Lesson): FormGroup {
    return this.fb.group({
      id: [lesson?.id || ''],
      title: [lesson?.title || '', Validators.required],
      description: [lesson?.description || '', Validators.required],
      videoUrl: [lesson?.videoUrl || '', Validators.required],
      duration: [lesson?.duration || 0, [Validators.required, Validators.min(1)]],
      order: [lesson?.order || 0, Validators.required],
      isPreview: [lesson?.isPreview || false]
    });
  }

  // Form Array Getters
  get learningObjectives(): FormArray {
    return this.courseForm.get('learningObjectives') as FormArray;
  }

  get lessons(): FormArray {
    return this.courseForm.get('lessons') as FormArray;
  }

  // Learning Objectives Management
  addLearningObjective(): void {
    this.learningObjectives.push(this.fb.control('', Validators.required));
  }

  removeLearningObjective(index: number): void {
    this.learningObjectives.removeAt(index);
  }

  // Lessons Management
  addLesson(): void {
    const newLesson = this.createLessonFormGroup();
    newLesson.patchValue({ order: this.lessons.length + 1 });
    this.lessons.push(newLesson);
  }

  removeLesson(index: number): void {
    this.lessons.removeAt(index);
    this.updateLessonOrders();
  }

  moveLessonUp(index: number): void {
    if (index > 0) {
      const lesson = this.lessons.at(index);
      this.lessons.removeAt(index);
      this.lessons.insert(index - 1, lesson);
      this.updateLessonOrders();
    }
  }

  moveLessonDown(index: number): void {
    if (index < this.lessons.length - 1) {
      const lesson = this.lessons.at(index);
      this.lessons.removeAt(index);
      this.lessons.insert(index + 1, lesson);
      this.updateLessonOrders();
    }
  }

  private updateLessonOrders(): void {
    this.lessons.controls.forEach((lesson, index) => {
      lesson.patchValue({ order: index + 1 });
    });
  }

  // Tab Management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Form Validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  // Save Operations
  async saveDraft(): Promise<void> {
    await this.saveCourse(false);
  }

  async publishCourse(): Promise<void> {
    if (this.courseForm.invalid) {
      this.markFormGroupTouched(this.courseForm);
      this.notificationService.showError('Please fix all validation errors before publishing');
      return;
    }

    if (this.lessons.length === 0) {
      this.notificationService.showError('Please add at least one lesson before publishing');
      return;
    }

    await this.saveCourse(true);
  }

  private async saveCourse(publish: boolean): Promise<void> {
    try {
      this.isSaving = true;
      this.loadingService.setLoading(true);

      const courseData = this.prepareCourseData(publish);

      if (this.isEditMode && this.courseId) {
        await this.courseService.updateCourse(this.courseId, courseData);
        this.notificationService.showSuccess(
          publish ? 'Course published successfully!' : 'Course saved as draft'
        );
      } else {
        const newCourse = await this.courseService.createCourse(courseData);
        this.courseId = newCourse.id;
        this.isEditMode = true;
        this.router.navigate(['/instructor/courses', newCourse.id, 'edit'], { replaceUrl: true });
        this.notificationService.showSuccess(
          publish ? 'Course created and published!' : 'Course created as draft'
        );
      }
    } catch (error) {
      console.error('Error saving course:', error);
      this.notificationService.showError('Failed to save course');
    } finally {
      this.isSaving = false;
      this.loadingService.setLoading(false);
    }
  }

  private prepareCourseData(publish: boolean): Partial<Course> {
    const formValue = this.courseForm.value;
    
    return {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      level: formValue.level,
      price: formValue.price,
      thumbnailUrl: formValue.thumbnailUrl,
      prerequisites: formValue.prerequisites,
      learningObjectives: formValue.learningObjectives.filter((obj: string) => obj.trim()),
      lessons: formValue.lessons.map((lesson: LessonForm, index: number) => ({
        ...lesson,
        order: index + 1
      })),
      isPublished: publish,
      duration: this.calculateTotalDuration(formValue.lessons)
    };
  }

  private calculateTotalDuration(lessons: LessonForm[]): number {
    return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/instructor/dashboard']);
  }

  previewCourse(): void {
    if (this.courseId) {
      window.open(`/courses/${this.courseId}`, '_blank');
    }
  }

  // Utility Methods
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getTotalDuration(): string {
    const lessons = this.courseForm.get('lessons')?.value || [];
    const total = this.calculateTotalDuration(lessons);
    return this.formatDuration(total);
  }

  trackByIndex(index: number): number {
    return index;
  }
}