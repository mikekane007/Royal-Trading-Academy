import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumCategory } from './forum-category.entity';
import { ForumPost } from './forum-post.entity';

export enum ThreadStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PINNED = 'pinned',
  LOCKED = 'locked',
}

@Entity('forum_threads')
export class ForumThread extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ThreadStatus,
    default: ThreadStatus.OPEN,
  })
  status: ThreadStatus;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @Column({ default: false })
  isSticky: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  lastReplyAt: Date;

  @Column({ nullable: true })
  lastReplyUserId: string;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => ForumCategory, (category) => category.threads)
  @JoinColumn({ name: 'categoryId' })
  category: ForumCategory;

  @Column()
  categoryId: string;

  @OneToMany(() => ForumPost, (post) => post.thread)
  posts: ForumPost[];
}