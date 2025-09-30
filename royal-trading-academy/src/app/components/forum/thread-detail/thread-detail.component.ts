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
  templateUrl: './thread-detail.component.html',
  styleUrls: ['./thread-detail.component.scss']
})
export class ThreadDetailComponent implements OnInit, OnDestroy {
  thread?: ForumThread;
  replies: ForumReply[] = [];
  sortedReplies: ForumReply[] = [];
  currentUser: User | null = null;
  
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