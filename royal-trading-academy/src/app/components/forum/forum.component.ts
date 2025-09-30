import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { ForumService } from '../../services/forum/forum.service';
import { AuthService } from '../../services/auth/auth.service';
import { ForumThread, ForumStats, CreateThreadRequest } from '../../models/forum/forum.model';
import { User, UserRole } from '../../models/user/user.model';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit, OnDestroy {
  @Input() courseId?: string;

  threads: ForumThread[] = [];
  filteredThreads: ForumThread[] = [];
  forumStats?: ForumStats;
  currentUser: User | null = null;
  
  // UI State
  isLoading = true;
  showCreateThread = false;
  isCreatingThread = false;
  searchQuery = '';
  currentFilter = 'all';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 20;
  
  // Forms
  createThreadForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.createThreadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: ['']
    });

    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch();
    });
  }

  ngOnInit(): void {
    // Get course ID from route if not provided as input
    if (!this.courseId) {
      this.courseId = this.route.snapshot.paramMap.get('courseId') || undefined;
    }

    // Get current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    this.loadForumData();
    this.loadForumStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadForumData(): void {
    this.isLoading = true;
    
    if (this.courseId) {
      this.forumService.getThreadsByCourse(this.courseId, this.currentPage, this.itemsPerPage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.threads = response.threads;
            this.totalPages = Math.ceil(response.total / this.itemsPerPage);
            this.applyFilters();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Failed to load forum threads:', error);
            this.isLoading = false;
            // Use mock data for development
            this.loadMockData();
          }
        });
    } else {
      // Load mock data for development
      this.loadMockData();
    }
  }

  loadForumStats(): void {
    this.forumService.getForumStats(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.forumStats = stats;
        },
        error: (error) => {
          console.error('Failed to load forum stats:', error);
          // Use mock stats
          this.forumStats = {
            totalThreads: 25,
            totalReplies: 147,
            activeUsers: 18,
            resolvedThreads: 12
          };
        }
      });
  }

  createThread(): void {
    if (this.createThreadForm.valid && this.courseId) {
      this.isCreatingThread = true;
      
      const formValue = this.createThreadForm.value;
      const request: CreateThreadRequest = {
        courseId: this.courseId,
        title: formValue.title,
        content: formValue.content,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
      };

      this.forumService.createThread(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (thread) => {
            this.threads.unshift(thread);
            this.applyFilters();
            this.closeCreateThread();
            this.isCreatingThread = false;
          },
          error: (error) => {
            console.error('Failed to create thread:', error);
            this.isCreatingThread = false;
          }
        });
    }
  }

  closeCreateThread(): void {
    this.showCreateThread = false;
    this.createThreadForm.reset();
  }

  openThread(threadId: string): void {
    this.router.navigate(['/forum/thread', threadId]);
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.threads];

    switch (this.currentFilter) {
      case 'pinned':
        filtered = filtered.filter(thread => thread.isPinned);
        break;
      case 'resolved':
        filtered = filtered.filter(thread => thread.isResolved);
        break;
      case 'unresolved':
        filtered = filtered.filter(thread => !thread.isResolved);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(thread => 
        thread.title.toLowerCase().includes(query) ||
        thread.content.toLowerCase().includes(query) ||
        thread.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    this.filteredThreads = filtered;
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  performSearch(): void {
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadForumData();
    }
  }

  getEmptyStateMessage(): string {
    switch (this.currentFilter) {
      case 'pinned':
        return 'No pinned discussions yet.';
      case 'resolved':
        return 'No resolved discussions yet.';
      case 'unresolved':
        return 'No unresolved discussions yet.';
      default:
        return this.searchQuery ? 'No discussions match your search.' : 'No discussions yet. Be the first to start a conversation!';
    }
  }

  private loadMockData(): void {
    // Mock data for development
    this.threads = [
      {
        id: '1',
        courseId: this.courseId || 'course1',
        authorId: 'user1',
        author: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: UserRole.STUDENT,
          isInstructor: false,
          reputation: 150
        },
        title: 'Question about Risk Management in Forex Trading',
        content: 'I\'m having trouble understanding position sizing. Can someone explain the 2% rule and how to calculate the right position size for different currency pairs?',
        isPinned: false,
        isLocked: false,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
        replyCount: 5,
        lastReplyAt: new Date('2024-01-15T14:20:00Z'),
        lastReplyBy: {
          id: 'instructor1',
          firstName: 'Sarah',
          lastName: 'Chen',
          profileImage: '/assets/images/instructors/sarah-chen.svg',
          role: UserRole.INSTRUCTOR,
          isInstructor: true,
          reputation: 2500
        },
        tags: ['risk-management', 'position-sizing', 'forex'],
        upvotes: 8,
        downvotes: 0,
        isResolved: true
      },
      {
        id: '2',
        courseId: this.courseId || 'course1',
        authorId: 'user2',
        author: {
          id: 'user2',
          firstName: 'Alice',
          lastName: 'Smith',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: UserRole.STUDENT,
          isInstructor: false,
          reputation: 75
        },
        title: 'Best Trading Platforms for Beginners',
        content: 'What trading platforms do you recommend for someone just starting out? I\'m looking for something user-friendly with good educational resources.',
        isPinned: true,
        isLocked: false,
        createdAt: new Date('2024-01-14T09:15:00Z'),
        updatedAt: new Date('2024-01-14T09:15:00Z'),
        replyCount: 12,
        lastReplyAt: new Date('2024-01-16T11:45:00Z'),
        tags: ['platforms', 'beginners', 'recommendations'],
        upvotes: 15,
        downvotes: 1,
        isResolved: false
      }
    ];
    
    this.applyFilters();
    this.isLoading = false;
  }
}