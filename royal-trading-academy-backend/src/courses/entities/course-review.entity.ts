import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';

@Entity('course_reviews')
@Unique(['userId', 'courseId'])
export class CourseReview extends BaseEntity {
  @Column('int', { width: 1 })
  rating: number; // 1-5 stars

  @Column('text', { nullable: true })
  comment: string;

  @Column({ default: false })
  isVerified: boolean; // Only students who completed the course

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course, (course) => course.reviews)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;
}