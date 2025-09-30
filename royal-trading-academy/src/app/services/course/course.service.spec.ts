import { TestBed } from '@angular/core/testing';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CourseService]
    });
    service = TestBed.inject(CourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return courses', (done) => {
    service.getCourses().subscribe(courses => {
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return filtered courses', (done) => {
    const filters = { category: 'FOREX' };
    service.getCourses(filters).subscribe(courses => {
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      // Should filter to only forex courses
      courses.forEach(course => {
        expect(course.category).toBe('FOREX');
      });
      done();
    });
  });

  it('should return course by id', (done) => {
    service.getCourse('1').subscribe(course => {
      expect(course).toBeDefined();
      expect(course.id).toBe('1');
      done();
    });
  });

  it('should search courses', (done) => {
    service.searchCourses('forex').subscribe(courses => {
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      done();
    });
  });

  it('should enroll in course', (done) => {
    service.enrollInCourse('1').subscribe(response => {
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      done();
    });
  });

  it('should get enrolled courses', (done) => {
    service.getEnrolledCourses().subscribe(enrollments => {
      expect(enrollments).toBeDefined();
      expect(Array.isArray(enrollments)).toBe(true);
      done();
    });
  });

  it('should get course progress', (done) => {
    service.getCourseProgress('1').subscribe(progress => {
      expect(progress).toBeDefined();
      expect(progress.courseId).toBe('1');
      done();
    });
  });

  it('should update lesson progress', (done) => {
    service.updateLessonProgress('lesson-1', { completed: true }).subscribe(response => {
      expect(response).toBeDefined();
      expect(response.message).toBe('Progress updated');
      done();
    });
  });

  it('should rate course', (done) => {
    service.rateCourse('1', 5, 'Great course!').subscribe(response => {
      expect(response).toBeDefined();
      expect(response.message).toBe('Rating submitted');
      done();
    });
  });

  it('should get course categories', (done) => {
    service.getCourseCategories().subscribe(categories => {
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should get featured courses', (done) => {
    service.getFeaturedCourses().subscribe(courses => {
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      done();
    });
  });
});