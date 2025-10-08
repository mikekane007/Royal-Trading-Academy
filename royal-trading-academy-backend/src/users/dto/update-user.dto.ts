import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { UserRole, SubscriptionStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    example: UserRole.STUDENT,
    description: 'User role',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile image URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({
    example: SubscriptionStatus.ACTIVE,
    description: 'Subscription status',
    enum: SubscriptionStatus,
    required: false,
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  subscriptionStatus?: SubscriptionStatus;
}