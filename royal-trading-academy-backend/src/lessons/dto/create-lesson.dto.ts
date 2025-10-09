import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '../entities/lesson.entity';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Lesson content (for text lessons)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Lesson type', enum: LessonType })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiPropertyOptional({ description: 'Video URL (for video lessons)' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Lesson duration in seconds' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiProperty({ description: 'Order index in course', minimum: 0 })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ description: 'Is this a free preview lesson', default: false })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @ApiPropertyOptional({ description: 'Is lesson published', default: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Quiz data (for quiz lessons)' })
  @IsOptional()
  quizData?: any;

  @ApiPropertyOptional({ description: 'Assignment instructions (for assignment lessons)' })
  @IsString()
  @IsOptional()
  assignmentInstructions?: string;

  @ApiPropertyOptional({ description: 'Live session URL (for live lessons)' })
  @IsString()
  @IsOptional()
  liveSessionUrl?: string;

  @ApiPropertyOptional({ description: 'Live session date (for live lessons)' })
  @IsOptional()
  liveSessionDate?: Date;
}