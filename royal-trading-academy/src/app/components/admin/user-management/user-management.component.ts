import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserManagement } from '../../../services/admin/admin.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: UserManagement[] = [];
  filteredUsers: UserManagement[] = [];
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 20;
  totalUsers = 0;
  isLoading = true;
  Math = Math; // Expose Math to template

  roles = [
    { value: '', label: 'All Roles' },
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'admin', label: 'Admin' }
  ];

  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingService.setLoading(true);

      const result = await this.adminService.getUsers(
        this.currentPage,
        this.itemsPerPage,
        this.searchTerm
      );

      this.users = result.users;
      this.totalUsers = result.total;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading users:', error);
      this.notificationService.showError('Failed to load users');
    } finally {
      this.isLoading = false;
      this.loadingService.setLoading(false);
    }
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onRoleSelectChange(event: Event, user: UserManagement): void {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;
    this.updateUserRole(user, newRole);
  }

  async updateUserRole(user: UserManagement, newRole: string): Promise<void> {
    try {
      await this.adminService.updateUserRole(user.id, newRole);
      user.role = newRole as 'student' | 'instructor' | 'admin';
      this.notificationService.showSuccess(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      this.notificationService.showError('Failed to update user role');
    }
  }

  async toggleUserStatus(user: UserManagement): Promise<void> {
    try {
      await this.adminService.toggleUserStatus(user.id);
      user.isActive = !user.isActive;
      const status = user.isActive ? 'activated' : 'deactivated';
      this.notificationService.showSuccess(`User ${status} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      this.notificationService.showError('Failed to update user status');
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'instructor':
        return 'badge-instructor';
      case 'student':
        return 'badge-student';
      default:
        return 'badge-default';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-active' : 'badge-inactive';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }

  trackByUserId(index: number, user: UserManagement): string {
    return user.id;
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers(): UserManagement[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}