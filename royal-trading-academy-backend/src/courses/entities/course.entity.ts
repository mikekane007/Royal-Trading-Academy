import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { CourseReview } from './course-review.entity';

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseCategory {
  FOREX = 'forex',
  STOCKS = 'stocks',
  CRYPTOCURRENCY = 'cryptocurrency',
  OPTIONS = 'options',
  DAY_TRADING = 'day_trading',
  SWING_TRADING = 'swing_trading',
  TECHNICAL_ANALYSIS = 'technical_analysis',
  FUNDAMENTAL_ANALYSIS = 'fundamental_analysis',
  RISK_MANAGEMENT = 'risk_management',
  TRADING_PSYCHOLOGY = 'trading_psychology',
}

@Entity('courses')
export class Course extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  shortDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: CourseDifficulty,
    default: CourseDifficulty.BEGINNER,
  })
  difficulty: CourseDifficulty;

  @Column({
    type: 'enum',
    enum: CourseCategory,
  })
  category: CourseCategory;

  @Column({ nullable: true })
  duration: number; // in minutes

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  previewVideoUrl: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  learningObjectives: string[];

  @Column('simple-array', { nullable: true })
  prerequisites: string[];

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ default: 0 })
  enrollmentCount: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  certificateTemplate: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.coursesCreated)
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @Column()
  instructorId: string;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons: Lesson[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => CourseReview, (review) => review.course)
  reviews: CourseReview[];
}