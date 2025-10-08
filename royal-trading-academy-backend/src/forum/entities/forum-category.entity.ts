import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ForumThread } from './forum-thread.entity';

@Entity('forum_categories')
export class ForumCategory extends BaseEntity {
  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPrivate: boolean; // Only enrolled students can access

  @Column({ nullable: true })
  courseId: string; // If category is course-specific

  // Relationships
  @OneToMany(() => ForumThread, (thread) => thread.category)
  threads: ForumThread[];
}