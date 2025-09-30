import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ForumService } from '../../../services/forum/forum.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ForumThread, ForumReply, ModerateContentRequest } from '../../../models/forum/forum.model';
import { User, UserRole } from '../../../models/user/user.model';

@Component({
  selector: 'app-forum-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="moderation-container" *ngIf="canModerate">
      <div class="moderation-header">
        <h1>Forum Moderation</h1>
        <p class="header-description">
          Review and moderate flagged content to maintain community standards.
        </p>
      </div>

      <!-- Moderation Stats -->
      <div class="moderation-stats">
        <div class="stat-card">
          <div class="stat-number">{{ flaggedThreads.length }}</div>
          <div class="stat-label">Flagged Threads</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ flaggedReplies.length }}</div>
          <div class="stat-label">Flagged Replies</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalFlagged }}</div>
          <div class="stat-label">Total Pending</div>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="content-tabs">
        <button 
          class="tab-btn"
          [class.active]="activeTab === 'threads'"
          (click)="setActiveTab('threads')">
          Flagged Threads ({{ flaggedThreads.length }})
        </button>
        <button 
          class="tab-btn"
          [class.active]="activeTab === 'replies'"
          (click)="setActiveTab('replies')">
          Flagged Replies ({{ flaggedReplies.length }})
        </button>
      </div>

      <!-- Flagged Threads -->
      <div class="content-section" *ngIf="activeTab === 'threads'">
        <div class="flagged-items" *ngIf="flaggedThreads.length > 0">
          <div 
            class="flagged-item thread-item"
            *ngFor="let thread of flaggedThreads">
            
            <div class="item-header">
              <div class="item-info">
                <h3 class="item-title">{{ thread.title }}</h3>
                <div class="item-meta">
                  <span class="author">
                    By {{ thread.author.firstName }} {{ thread.author.lastName }}
                    <span class="instructor-badge" *ngIf="thread.author.isInstructor">Instructor</span>
                  </span>
                  <span class="date">{{ thread.createdAt | date:'MMM d, y \'at\' h:mm a' }}</span>
                  <span class="votes">{{ thread.upvotes - thread.downvotes }} votes</span>
                </div>
              </div>
              
              <div class="item-actions">
                <button 
                  class="action-btn view-btn"
                  (click)="viewThread(thread.id)">
                  View Thread
                </button>
              </div>
            </div>

            <div class="item-content">
              <p class="content-preview">{{ thread.content | slice:0:300 }}{{ thread.content.length > 300 ? '...' : '' }}</p>
              
              <div class="content-tags" *ngIf="thread.tags.length > 0">
                <span class="tag" *ngFor="let tag of thread.tags">{{ tag }}</span>
              </div>
            </div>

            <div class="moderation-actions">
              <div class="action-group">
                <button 
                  class="mod-btn approve-btn"
                  (click)="moderateContent(thread.id, 'thread', 'approve')"
                  [disabled]="isProcessing">
                  ✓ Approve
                </button>
                <button 
                  class="mod-btn reject-btn"
                  (click)="showRejectModal(thread.id, 'thread')"
                  [disabled]="isProcessing">
                  ✗ Reject
                </button>
                <button 
                  class="mod-btn flag-btn"
                  (click)="showFlagModal(thread.id, 'thread')"
                  [disabled]="isProcessing">
                  🚩 Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="flaggedThreads.length === 0 && !isLoading">
          <div class="empty-icon">✅</div>
          <h3>No flagged threads</h3>
          <p>All threads are currently approved or no content has been flagged for review.</p>
        </div>
      </div>

      <!-- Flagged Replies -->
      <div class="content-section" *ngIf="activeTab === 'replies'">
        <div class="flagged-items" *ngIf="flaggedReplies.length > 0">
          <div 
            class="flagged-item reply-item"
            *ngFor="let reply of flaggedReplies">
            
            <div class="item-header">
              <div class="item-info">
                <h4 class="reply-context">Reply in discussion</h4>
                <div class="item-meta">
                  <span class="author">
                    By {{ reply.author.firstName }} {{ reply.author.lastName }}
                    <span class="instructor-badge" *ngIf="reply.author.isInstructor">Instructor</span>
                  </span>
                  <span class="date">{{ reply.createdAt | date:'MMM d, y \'at\' h:mm a' }}</span>
                  <span class="votes">{{ reply.upvotes - reply.downvotes }} votes</span>
                </div>
              </div>
              
              <div class="item-actions">
                <button 
                  class="action-btn view-btn"
                  (click)="viewReply(reply.threadId, reply.id)">
                  View Reply
                </button>
              </div>
            </div>

            <div class="item-content">
              <p class="content-preview">{{ reply.content | slice:0:300 }}{{ reply.content.length > 300 ? '...' : '' }}</p>
            </div>

            <div class="moderation-actions">
              <div class="action-group">
                <button 
                  class="mod-btn approve-btn"
                  (click)="moderateContent(reply.id, 'reply', 'approve')"
                  [disabled]="isProcessing">
                  ✓ Approve
                </button>
                <button 
                  class="mod-btn reject-btn"
                  (click)="showRejectModal(reply.id, 'reply')"
                  [disabled]="isProcessing">
                  ✗ Reject
                </button>
                <button 
                  class="mod-btn flag-btn"
                  (click)="showFlagModal(reply.id, 'reply')"
                  [disabled]="isProcessing">
                  🚩 Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="flaggedReplies.length === 0 && !isLoading">
          <div class="empty-icon">✅</div>
          <h3>No flagged replies</h3>
          <p>All replies are currently approved or no content has been flagged for review.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Loading flagged content...</p>
      </div>

      <!-- Moderation Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          
          <div class="modal-body">
            <p>{{ modalMessage }}</p>
            
            <div class="form-group" *ngIf="modalAction === 'reject' || modalAction === 'flag'">
              <label for="reason">Reason (optional)</label>
              <textarea 
                id="reason"
                [(ngModel)]="moderationReason"
                placeholder="Provide a reason for this action..."
                rows="3"
                class="form-control"></textarea>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closeModal()">
              Cancel
            </button>
            <button 
              class="btn"
              [class.btn-danger]="modalAction === 'reject'"
              [class.btn-warning]="modalAction === 'flag'"
              [class.btn-primary]="modalAction === 'approve'"
              (click)="confirmModeration()"
              [disabled]="isProcessing">
              {{ isProcessing ? 'Processing...' : modalConfirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Denied -->
    <div class="access-denied" *ngIf="!canModerate && !isLoading">
      <div class="error-icon">🚫</div>
      <h2>Access Denied</h2>
      <p>You don't have permission to access the moderation panel.</p>
      <button class="btn btn-primary" (click)="goBack()">Go Back</button>
    </div>
  `,
  styleUrls: ['./forum-moderation.component.scss']
})
export class ForumModerationComponent implements OnInit, OnDestroy {
  flaggedThreads: ForumThread[] = [];
  flaggedReplies: ForumReply[] = [];
  currentUser?: User;
  
  // UI State
  isLoading = true;
  isProcessing = false;
  activeTab: 'threads' | 'replies' = 'threads';
  
  // Modal State
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalAction: 'approve' | 'reject' | 'flag' = 'approve';
  modalConfirmText = '';
  moderationReason = '';
  selectedContentId = '';
  selectedContentType: 'thread' | 'reply' = 'thread';
  
  private destroy$ = new Subject<void>();

  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user and check permissions
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      if (this.canModerate) {
        this.loadFlaggedContent();
      } else {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canModerate(): boolean {
    return this.currentUser?.role === UserRole.INSTRUCTOR || this.currentUser?.role === UserRole.ADMIN;
  }

  get totalFlagged(): number {
    return this.flaggedThreads.length + this.flaggedReplies.length;
  }

  loadFlaggedContent(): void {
    this.isLoading = true;
    
    this.forumService.getFlaggedContent()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.flaggedThreads = response.threads;
          this.flaggedReplies = response.replies;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load flagged content:', error);
          this.isLoading = false;
          // Use mock data for development
          this.loadMockFlaggedContent();
        }
      });
  }

  setActiveTab(tab: 'threads' | 'replies'): void {
    this.activeTab = tab;
  }

  viewThread(threadId: string): void {
    this.router.navigate(['/forum/thread', threadId]);
  }

  viewReply(threadId: string, replyId: string): void {
    this.router.navigate(['/forum/thread', threadId], {
      fragment: `reply-${replyId}`
    });
  }

  showRejectModal(contentId: string, contentType: 'thread' | 'reply'): void {
    this.selectedContentId = contentId;
    this.selectedContentType = contentType;
    this.modalAction = 'reject';
    this.modalTitle = `Reject ${contentType}`;
    this.modalMessage = `Are you sure you want to reject this ${contentType}? This action will remove it from the forum.`;
    this.modalConfirmText = 'Reject';
    this.moderationReason = '';
    this.showModal = true;
  }

  showFlagModal(contentId: string, contentType: 'thread' | 'reply'): void {
    this.selectedContentId = contentId;
    this.selectedContentType = contentType;
    this.modalAction = 'flag';
    this.modalTitle = `Flag ${contentType}`;
    this.modalMessage = `Flag this ${contentType} for further review by administrators.`;
    this.modalConfirmText = 'Flag for Review';
    this.moderationReason = '';
    this.showModal = true;
  }

  moderateContent(contentId: string, contentType: 'thread' | 'reply', action: 'approve' | 'reject' | 'flag'): void {
    if (action === 'approve') {
      this.performModeration(contentId, contentType, action);
    } else {
      // For reject and flag, show modal first
      if (action === 'reject') {
        this.showRejectModal(contentId, contentType);
      } else {
        this.showFlagModal(contentId, contentType);
      }
    }
  }

  confirmModeration(): void {
    this.performModeration(this.selectedContentId, this.selectedContentType, this.modalAction);
  }

  performModeration(contentId: string, contentType: 'thread' | 'reply', action: 'approve' | 'reject' | 'flag'): void {
    this.isProcessing = true;
    
    const request: ModerateContentRequest = {
      contentId,
      contentType,
      action,
      reason: this.moderationReason || undefined
    };

    this.forumService.moderateContent(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove the moderated content from the lists
          if (contentType === 'thread') {
            this.flaggedThreads = this.flaggedThreads.filter(t => t.id !== contentId);
          } else {
            this.flaggedReplies = this.flaggedReplies.filter(r => r.id !== contentId);
          }
          
          this.isProcessing = false;
          this.closeModal();
        },
        error: (error) => {
          console.error('Failed to moderate content:', error);
          this.isProcessing = false;
        }
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.moderationReason = '';
    this.selectedContentId = '';
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  private loadMockFlaggedContent(): void {
    // Mock data for development
    this.flaggedThreads = [
      {
        id: 'flagged-thread-1',
        courseId: 'course1',
        authorId: 'user5',
        author: {
          id: 'user5',
          firstName: 'Spam',
          lastName: 'User',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: UserRole.STUDENT,
          isInstructor: false,
          reputation: 0
        },
        title: 'Get Rich Quick with This Amazing Trading Strategy!!!',
        content: 'Hey everyone! I found this AMAZING trading strategy that will make you RICH in just 30 days! Click this link to learn more... [suspicious content continues]',
        isPinned: false,
        isLocked: false,
        createdAt: new Date('2024-01-16T09:30:00Z'),
        updatedAt: new Date('2024-01-16T09:30:00Z'),
        replyCount: 0,
        tags: ['scam', 'get-rich-quick'],
        upvotes: 0,
        downvotes: 5,
        isResolved: false
      }
    ];

    this.flaggedReplies = [
      {
        id: 'flagged-reply-1',
        threadId: '1',
        authorId: 'user6',
        author: {
          id: 'user6',
          firstName: 'Rude',
          lastName: 'Commenter',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: UserRole.STUDENT,
          isInstructor: false,
          reputation: 10
        },
        content: 'This is completely wrong and you clearly don\'t know what you\'re talking about. Anyone who follows this advice is an idiot.',
        createdAt: new Date('2024-01-16T10:15:00Z'),
        updatedAt: new Date('2024-01-16T10:15:00Z'),
        upvotes: 0,
        downvotes: 3,
        isInstructorResponse: false,
        isBestAnswer: false,
        isModerated: false
      }
    ];
    
    this.isLoading = false;
  }
}