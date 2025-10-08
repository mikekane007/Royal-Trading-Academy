import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  REFUNDED = 'refunded',
}

@Entity('enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment extends BaseEntity {
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ nullable: true })
  completedAt: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number; // percentage 0-100

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ default: false })
  certificateIssued: boolean;

  @Column({ nullable: true })
  certificateUrl: string;

  @Column({ nullable: true })
  certificateIssuedAt: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  paidAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundedAmount: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;
}