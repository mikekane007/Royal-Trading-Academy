import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxUses?: number;

  @IsOptional()
  isActive?: boolean = true;
}