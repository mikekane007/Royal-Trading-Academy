import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumThread } from './forum-thread.entity';

export enum PostStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
  PENDING_MODERATION = 'pending_moderation',
}

@Entity('forum_posts')
export class ForumPost extends BaseEntity {
  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: false })
  isInstructorResponse: boolean;

  @Column({ default: false })
  isBestAnswer: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ nullable: true })
  parentPostId: string; // For nested replies

  @Column('text', { nullable: true })
  moderationReason: string;

  @Column({ nullable: true })
  moderatedBy: string;

  @Column({ nullable: true })
  moderatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.forumPosts)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => ForumThread, (thread) => thread.posts)
  @JoinColumn({ name: 'threadId' })
  thread: ForumThread;

  @Column()
  threadId: string;
}