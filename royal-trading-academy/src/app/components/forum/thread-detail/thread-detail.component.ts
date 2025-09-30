import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ForumService } from '../../../services/forum/forum.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ForumThread, ForumReply, CreateReplyRequest, VoteRequest } from '../../../models/forum/forum.model';
import { User, UserRole } from '../../../models/user/user.model';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="thread-detail-container" *ngIf="thread">
      <!-- Thread Header -->
      <div class="thread-header">
        <div class="breadcrumb">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Forum
          </button>
        </div>

        <div class="thread-main">
          <div class="thread-status-bar">
            <div class="status-indicators">
              <span class="pin-indicator" *ngIf="thread.isPinned" title="Pinned">📌 Pinned</span>
              <span class="lock-indicator" *ngIf="thread.isLocked" title="Locked">🔒 Locked</span>
              <span class="resolved-indicator" *ngIf="thread.isResolved" title="Resolved">✅ Resolved</span>
            </div>
            
            <div class="thread-actions" *ngIf="canModerate">
              <button class="action-btn" (click)="togglePin()" [disabled]="isUpdating">
                {{ thread.isPinned ? 'Unpin' : 'Pin' }}
              </button>
              <button class="action-btn" (click)="toggleLock()" [disabled]="isUpdating">
                {{ thread.isLocked ? 'Unlock' : 'Lock' }}
              </button>
              <button class="action-btn" (click)="toggleResolved()" [disabled]="isUpdating">
                {{ thread.isResolved ? 'Mark Unresolved' : 'Mark Resolved' }}
              </button>
            </div>
          </div>

          <h1 class="thread-title">{{ thread.title }}</h1>
          
          <div class="thread-meta">
            <div class="author-info">
              <img 
                [src]="thread.author.profileImage || '/assets/images/profile-placeholder.svg'" 
                [alt]="thread.author.firstName + ' ' + thread.author.lastName"
                class="author-avatar">
              <div class="author-details">
                <span class="author-name">
                  {{ thread.author.firstName }} {{ thread.author.lastName }}
                  <span class="instructor-badge" *ngIf="thread.author.isInstructor">Instructor</span>
                </span>
                <span class="post-date">{{ thread.createdAt | date:'MMM d, y \'at\' h:mm a' }}</span>
              </div>
            </div>
            
            <div class="thread-stats">
              <span class="reply-count">{{ thread.replyCount }} replies</span>
              <span class="view-count">{{ thread.upvotes }} votes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Thread Content -->
      <div class="thread-content">
        <div class="content-body">
          <div class="vote-section">
            <button 
              class="vote-btn upvote"
              [class.active]="userVote === 'upvote'"
              (click)="vote('upvote')"
              [disabled]="!currentUser">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </button>
            <span class="vote-count">{{ thread.upvotes - thread.downvotes }}</span>
            <button 
              class="vote-btn downvote"
              [class.active]="userVote === 'downvote'"
              (click)="vote('downvote')"
              [disabled]="!currentUser">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          <div class="content-text">
            <div class="thread-body" [innerHTML]="formatContent(thread.content)"></div>
            
            <div class="thread-tags" *ngIf="thread.tags.length > 0">
              <span class="tag" *ngFor="let tag of thread.tags">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Replies Section -->
      <div class="replies-section">
        <div class="replies-header">
          <h2>{{ thread.replyCount }} {{ thread.replyCount === 1 ? 'Reply' : 'Replies' }}</h2>
          <div class="sort-options">
            <select [(ngModel)]="sortBy" (change)="sortReplies()" class="sort-select">
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
              <option value="votes">Most Votes</option>
            </select>
          </div>
        </div>

        <!-- Reply Form -->
        <div class="reply-form-section" *ngIf="currentUser && !thread.isLocked">
          <form [formGroup]="replyForm" (ngSubmit)="submitReply()" class="reply-form">
            <div class="form-header">
              <img 
                [src]="currentUser.profileImage || '/assets/images/profile-placeholder.svg'" 
                [alt]="currentUser.firstName + ' ' + currentUser.lastName"
                class="user-avatar">
              <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
            </div>
            
            <div class="form-body">
              <textarea 
                formControlName="content"
                placeholder="Share your thoughts or ask a follow-up question..."
                rows="4"
                class="reply-textarea"></textarea>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="replyForm.invalid || isSubmittingReply">
                  {{ isSubmittingReply ? 'Posting...' : 'Post Reply' }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Locked Thread Message -->
        <div class="locked-message" *ngIf="thread.isLocked">
          <div class="lock-icon">🔒</div>
          <p>This discussion has been locked and no longer accepts new replies.</p>
        </div>

        <!-- Login Prompt -->
        <div class="login-prompt" *ngIf="!currentUser">
          <p>Please <a routerLink="/login">log in</a> to participate in the discussion.</p>
        </div>

        <!-- Replies List -->
        <div class="replies-list" *ngIf="replies.length > 0">
          <div 
            class="reply-item"
            *ngFor="let reply of sortedReplies; trackBy: trackReply"
            [class.instructor-reply]="reply.isInstructorResponse"
            [class.best-answer]="reply.isBestAnswer">
            
            <div class="reply-header">
              <div class="author-info">
                <img 
                  [src]="reply.author.profileImage || '/assets/images/profile-placeholder.svg'" 
                  [alt]="reply.author.firstName + ' ' + reply.author.lastName"
                  class="author-avatar">
                <div class="author-details">
                  <span class="author-name">
                    {{ reply.author.firstName }} {{ reply.author.lastName }}
                    <span class="instructor-badge" *ngIf="reply.author.isInstructor">Instructor</span>
                    <span class="best-answer-badge" *ngIf="reply.isBestAnswer">Best Answer</span>
                  </span>
                  <span class="post-date">{{ reply.createdAt | date:'MMM d, y \'at\' h:mm a' }}</span>
                </div>
              </div>
              
              <div class="reply-actions" *ngIf="canModerateReply(reply)">
                <button 
                  class="action-btn"
                  *ngIf="!reply.isBestAnswer && !thread.isResolved"
                  (click)="markBestAnswer(reply.id)">
                  Mark as Best Answer
                </button>
              </div>
            </div>

            <div class="reply-content">
              <div class="vote-section">
                <button 
                  class="vote-btn upvote"
                  [class.active]="getUserVoteForReply(reply.id) === 'upvote'"
                  (click)="voteOnReply(reply.id, 'upvote')"
                  [disabled]="!currentUser">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </button>
                <span class="vote-count">{{ reply.upvotes - reply.downvotes }}</span>
                <button 
                  class="vote-btn downvote"
                  [class.active]="getUserVoteForReply(reply.id) === 'downvote'"
                  (click)="voteOnReply(reply.id, 'downvote')"
                  [disabled]="!currentUser">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              </div>

              <div class="content-text">
                <div class="reply-body" [innerHTML]="formatContent(reply.content)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Replies State -->
        <div class="no-replies" *ngIf="replies.length === 0 && !isLoadingReplies">
          <div class="empty-icon">💬</div>
          <h3>No replies yet</h3>
          <p>Be the first to share your thoughts on this discussion.</p>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoadingReplies">
          <div class="loading-spinner"></div>
          <p>Loading replies...</p>
        </div>
      </div>
    </div>

    <!-- Loading Thread State -->
    <div class="loading-thread" *ngIf="!thread && isLoadingThread">
      <div class="loading-spinner"></div>
      <p>Loading discussion...</p>
    </div>

    <!-- Thread Not Found -->
    <div class="thread-not-found" *ngIf="!thread && !isLoadingThread">
      <div class="error-icon">❌</div>
      <h2>Discussion Not Found</h2>
      <p>The discussion you're looking for doesn't exist or has been removed.</p>
      <button class="btn btn-primary" (click)="goBack()">Back to Forum</button>
    </div>
  `,
  styleUrls: ['./thread-detail.component.scss']
})
export class ThreadDetailComponent implements OnInit, OnDestroy {
  thread?: ForumThread;
  replies: ForumReply[] = [];
  sortedReplies: ForumReply[] = [];
  currentUser?: User;
  
  // UI State
  isLoadingThread = true;
  isLoadingReplies = true;
  isSubmittingReply = false;
  isUpdating = false;
  sortBy = 'oldest';
  
  // User interactions
  userVote?: 'upvote' | 'downvote';
  userReplyVotes: { [replyId: string]: 'upvote' | 'downvote' } = {};
  
  // Forms
  replyForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  private threadId: string;

  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.threadId = this.route.snapshot.paramMap.get('id') || '';
    
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    this.loadThread();
    this.loadReplies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canModerate(): boolean {
    return this.currentUser?.role === UserRole.INSTRUCTOR || this.currentUser?.role === UserRole.ADMIN;
  }

  canModerateReply(reply: ForumReply): boolean {
    return this.canModerate || reply.authorId === this.currentUser?.id;
  }

  loadThread(): void {
    this.isLoadingThread = true;
    
    this.forumService.getThread(this.threadId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (thread) => {
          this.thread = thread;
          this.isLoadingThread = false;
        },
        error: (error) => {
          console.error('Failed to load thread:', error);
          this.isLoadingThread = false;
          // Use mock data for development
          this.loadMockThread();
        }
      });
  }

  loadReplies(): void {
    this.isLoadingReplies = true;
    
    this.forumService.getRepliesByThread(this.threadId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.replies = response.replies;
          this.sortReplies();
          this.isLoadingReplies = false;
        },
        error: (error) => {
          console.error('Failed to load replies:', error);
          this.isLoadingReplies = false;
          // Use mock data for development
          this.loadMockReplies();
        }
      });
  }

  submitReply(): void {
    if (this.replyForm.valid && this.thread) {
      this.isSubmittingReply = true;
      
      const request: CreateReplyRequest = {
        threadId: this.thread.id,
        content: this.replyForm.value.content
      };

      this.forumService.createReply(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (reply) => {
            this.replies.push(reply);
            this.sortReplies();
            this.replyForm.reset();
            this.isSubmittingReply = false;
            
            // Update thread reply count
            if (this.thread) {
              this.thread.replyCount++;
            }
          },
          error: (error) => {
            console.error('Failed to create reply:', error);
            this.isSubmittingReply = false;
          }
        });
    }
  }

  vote(voteType: 'upvote' | 'downvote'): void {
    if (!this.currentUser || !this.thread) return;

    const request: VoteRequest = {
      contentId: this.thread.id,
      contentType: 'thread',
      voteType: this.userVote === voteType ? 'remove' : voteType
    };

    this.forumService.voteOnContent(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (this.thread) {
            this.thread.upvotes = result.upvotes;
            this.thread.downvotes = result.downvotes;
            this.userVote = this.userVote === voteType ? undefined : voteType;
          }
        },
        error: (error) => {
          console.error('Failed to vote:', error);
        }
      });
  }

  voteOnReply(replyId: string, voteType: 'upvote' | 'downvote'): void {
    if (!this.currentUser) return;

    const currentVote = this.userReplyVotes[replyId];
    const request: VoteRequest = {
      contentId: replyId,
      contentType: 'reply',
      voteType: currentVote === voteType ? 'remove' : voteType
    };

    this.forumService.voteOnContent(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const reply = this.replies.find(r => r.id === replyId);
          if (reply) {
            reply.upvotes = result.upvotes;
            reply.downvotes = result.downvotes;
            
            if (currentVote === voteType) {
              delete this.userReplyVotes[replyId];
            } else {
              this.userReplyVotes[replyId] = voteType;
            }
          }
        },
        error: (error) => {
          console.error('Failed to vote on reply:', error);
        }
      });
  }

  markBestAnswer(replyId: string): void {
    this.forumService.markBestAnswer(replyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedReply) => {
          const replyIndex = this.replies.findIndex(r => r.id === replyId);
          if (replyIndex !== -1) {
            this.replies[replyIndex] = updatedReply;
            this.sortReplies();
          }
        },
        error: (error) => {
          console.error('Failed to mark best answer:', error);
        }
      });
  }

  togglePin(): void {
    if (!this.thread) return;
    
    this.isUpdating = true;
    const action = this.thread.isPinned ? 
      this.forumService.unpinThread(this.thread.id) : 
      this.forumService.pinThread(this.thread.id);

    action.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedThread) => {
          this.thread = updatedThread;
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Failed to toggle pin:', error);
          this.isUpdating = false;
        }
      });
  }

  toggleLock(): void {
    if (!this.thread) return;
    
    this.isUpdating = true;
    const action = this.thread.isLocked ? 
      this.forumService.unlockThread(this.thread.id) : 
      this.forumService.lockThread(this.thread.id);

    action.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedThread) => {
          this.thread = updatedThread;
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Failed to toggle lock:', error);
          this.isUpdating = false;
        }
      });
  }

  toggleResolved(): void {
    if (!this.thread) return;
    
    this.isUpdating = true;
    this.forumService.markThreadResolved(this.thread.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedThread) => {
          this.thread = updatedThread;
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Failed to toggle resolved status:', error);
          this.isUpdating = false;
        }
      });
  }

  sortReplies(): void {
    this.sortedReplies = [...this.replies];
    
    switch (this.sortBy) {
      case 'newest':
        this.sortedReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'votes':
        this.sortedReplies.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      default: // oldest
        this.sortedReplies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    // Always put best answer first if it exists
    const bestAnswerIndex = this.sortedReplies.findIndex(r => r.isBestAnswer);
    if (bestAnswerIndex > 0) {
      const bestAnswer = this.sortedReplies.splice(bestAnswerIndex, 1)[0];
      this.sortedReplies.unshift(bestAnswer);
    }
  }

  getUserVoteForReply(replyId: string): 'upvote' | 'downvote' | undefined {
    return this.userReplyVotes[replyId];
  }

  formatContent(content: string): string {
    // Basic formatting - convert line breaks to <br> tags
    return content.replace(/\n/g, '<br>');
  }

  trackReply(index: number, reply: ForumReply): string {
    return reply.id;
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  private loadMockThread(): void {
    // Mock data for development
    this.thread = {
      id: this.threadId,
      courseId: 'course1',
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
      content: `I'm having trouble understanding position sizing and risk management in forex trading. Can someone explain the 2% rule and how to calculate the right position size for different currency pairs?

I've been trading for a few months now, but I keep making the same mistakes with position sizing. Sometimes I risk too much on a single trade, and other times I risk too little and miss out on potential profits.

Here are my specific questions:
1. How do you calculate position size using the 2% rule?
2. Does the 2% rule apply to all currency pairs equally?
3. Should I adjust my risk based on market volatility?
4. What tools do you recommend for position size calculation?

Any help would be greatly appreciated!`,
      isPinned: false,
      isLocked: false,
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
      replyCount: 3,
      lastReplyAt: new Date('2024-01-15T14:20:00Z'),
      tags: ['risk-management', 'position-sizing', 'forex'],
      upvotes: 8,
      downvotes: 0,
      isResolved: true
    };
    
    this.isLoadingThread = false;
  }

  private loadMockReplies(): void {
    // Mock data for development
    this.replies = [
      {
        id: '1',
        threadId: this.threadId,
        authorId: 'instructor1',
        author: {
          id: 'instructor1',
          firstName: 'Sarah',
          lastName: 'Chen',
          profileImage: '/assets/images/instructors/sarah-chen.svg',
          role: UserRole.INSTRUCTOR,
          isInstructor: true,
          reputation: 2500
        },
        content: `Great question, John! The 2% rule is indeed a fundamental principle of risk management. Let me break this down for you:

**1. Calculating Position Size with the 2% Rule:**
- Determine your account balance (e.g., $10,000)
- Calculate 2% of that amount ($200 maximum risk per trade)
- Identify your stop loss distance in pips
- Use the formula: Position Size = Risk Amount / (Stop Loss in Pips × Pip Value)

**2. Currency Pair Considerations:**
The 2% rule applies universally, but pip values vary between pairs. For example:
- EUR/USD: 1 pip = $10 for a standard lot
- USD/JPY: 1 pip = $9.09 for a standard lot (approximately)

**3. Market Volatility Adjustments:**
Yes, you should consider volatility. During high volatility periods, you might want to:
- Use wider stop losses
- Reduce position size slightly
- Consider using ATR (Average True Range) for dynamic stop placement

**4. Recommended Tools:**
- Position Size Calculator (many brokers provide these)
- TradingView's built-in risk management tools
- Excel spreadsheets for manual calculations

Hope this helps! Feel free to ask if you need clarification on any of these points.`,
        createdAt: new Date('2024-01-15T11:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        upvotes: 12,
        downvotes: 0,
        isInstructorResponse: true,
        isBestAnswer: true,
        isModerated: false
      },
      {
        id: '2',
        threadId: this.threadId,
        authorId: 'user3',
        author: {
          id: 'user3',
          firstName: 'Mike',
          lastName: 'Johnson',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: UserRole.STUDENT,
          isInstructor: false,
          reputation: 200
        },
        content: `Thanks Sarah! That explanation is really helpful. 

I have a follow-up question: If I want to risk $200 and my stop loss is 50 pips away, how do I calculate the exact position size for EUR/USD?

Using your formula:
Position Size = $200 / (50 pips × $10) = $200 / $500 = 0.4 lots

Is this correct? And would this be considered a mini lot (0.4) or should I round to the nearest standard increment?`,
        createdAt: new Date('2024-01-15T11:30:00Z'),
        updatedAt: new Date('2024-01-15T11:30:00Z'),
        upvotes: 3,
        downvotes: 0,
        isInstructorResponse: false,
        isBestAnswer: false,
        isModerated: false
      },
      {
        id: '3',
        threadId: this.threadId,
        authorId: 'user4',
        author: {
          id: 'user4',
          firstName: 'Lisa',
          lastName: 'Wang',
          profileImage: '/assets/images/profile-placeholder.svg',
          role: UserRole.STUDENT,
          isInstructor: false,
          reputation: 85
        },
        content: `This is exactly what I needed to learn too! I've been struggling with the same issues.

One thing I'd add is that I use a risk management spreadsheet that automatically calculates position sizes for me. It's been a game-changer for my trading consistency.

@Mike - Yes, your calculation looks correct! Most brokers allow you to trade in increments of 0.01 lots (micro lots), so 0.4 lots should be fine. Just make sure your broker supports that position size.`,
        createdAt: new Date('2024-01-15T12:15:00Z'),
        updatedAt: new Date('2024-01-15T12:15:00Z'),
        upvotes: 5,
        downvotes: 0,
        isInstructorResponse: false,
        isBestAnswer: false,
        isModerated: false
      }
    ];
    
    this.sortReplies();
    this.isLoadingReplies = false;
  }
}