import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string = 'usd';

  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  subscriptionType?: 'MONTHLY' | 'YEARLY' | 'LIFETIME';

  @IsString()
  @IsOptional()
  promoCode?: string;
}