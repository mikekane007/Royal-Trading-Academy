import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, CourseApproval } from '../../../services/admin/admin.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-moderation.component.html',
  styleUrls: ['./content-moderation.component.scss']
})
export class ContentModerationComponent implements OnInit {
  pendingCourses: CourseApproval[] = [];
  filteredCourses: CourseApproval[] = [];
  isLoading = true;
  selectedCategory = '';
  searchTerm = '';

  categories = [
    { value: '', label: 'All Categories' },
    { value: 'Forex', label: 'Forex' },
    { value: 'Stocks', label: 'Stocks' },
    { value: 'Options', label: 'Options' },
    { value: 'Cryptocurrency', label: 'Cryptocurrency' },
    { value: 'Commodities', label: 'Commodities' }
  ];

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPendingCourses();
  }

  async loadPendingCourses(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingService.setLoading(true);

      this.pendingCourses = await this.adminService.getPendingCourses();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading pending courses:', error);
      this.notificationService.showError('Failed to load pending courses');
    } finally {
      this.isLoading = false;
      this.loadingService.setLoading(false);
    }
  }

  applyFilters(): void {
    this.filteredCourses = this.pendingCourses.filter(course => {
      const matchesSearch = !this.searchTerm || 
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  async approveCourse(course: CourseApproval): Promise<void> {
    try {
      await this.adminService.approveCourse(course.id);
      course.status = 'approved';
      this.notificationService.showSuccess(`Course "${course.title}" approved successfully`);
      this.removeCourseFromList(course.id);
    } catch (error) {
      console.error('Error approving course:', error);
      this.notificationService.showError('Failed to approve course');
    }
  }

  async rejectCourse(course: CourseApproval): Promise<void> {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await this.adminService.rejectCourse(course.id, reason);
      course.status = 'rejected';
      this.notificationService.showSuccess(`Course "${course.title}" rejected`);
      this.removeCourseFromList(course.id);
    } catch (error) {
      console.error('Error rejecting course:', error);
      this.notificationService.showError('Failed to reject course');
    }
  }

  private removeCourseFromList(courseId: string): void {
    this.pendingCourses = this.pendingCourses.filter(course => course.id !== courseId);
    this.applyFilters();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  trackByCourseId(index: number, course: CourseApproval): string {
    return course.id;
  }

  refreshData(): void {
    this.loadPendingCourses();
  }
}