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
  templateUrl: './forum-moderation.component.html',
  styleUrls: ['./forum-moderation.component.scss']
})
export class ForumModerationComponent implements OnInit, OnDestroy {
  flaggedThreads: ForumThread[] = [];
  flaggedReplies: ForumReply[] = [];
  currentUser: User | null = null;
  
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