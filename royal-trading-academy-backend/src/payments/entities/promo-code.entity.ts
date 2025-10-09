import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Payment } from './payment.entity';

@Entity('promo_codes')
export class PromoCode extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: null })
  maxUses: number;

  @Column({ default: 0 })
  currentUses: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Payment, payment => payment.promoCode)
  payments: Payment[];
}