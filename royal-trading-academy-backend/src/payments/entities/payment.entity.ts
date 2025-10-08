import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column()
  transactionId: string; // External payment provider ID

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column('simple-json', { nullable: true })
  metadata: any; // Additional payment data

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundedAmount: number;

  @Column({ nullable: true })
  refundReason: string;

  @Column({ nullable: true })
  invoiceUrl: string;

  @Column({ nullable: true })
  receiptUrl: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;
}