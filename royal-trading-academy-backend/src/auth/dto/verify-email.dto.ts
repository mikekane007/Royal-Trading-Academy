import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'verification-token-here',
    description: 'Email verification token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}