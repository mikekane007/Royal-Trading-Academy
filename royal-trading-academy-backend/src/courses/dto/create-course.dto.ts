import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseDifficulty, CourseCategory } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Short course description' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ description: 'Course price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Course difficulty level', enum: CourseDifficulty })
  @IsEnum(CourseDifficulty)
  difficulty: CourseDifficulty;

  @ApiProperty({ description: 'Course category', enum: CourseCategory })
  @IsEnum(CourseCategory)
  category: CourseCategory;

  @ApiPropertyOptional({ description: 'Course duration in minutes' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ description: 'Course thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Preview video URL' })
  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  @ApiPropertyOptional({ description: 'Course tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Learning objectives', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

  @ApiPropertyOptional({ description: 'Course prerequisites', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional({ description: 'Is course featured', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Certificate template' })
  @IsString()
  @IsOptional()
  certificateTemplate?: string;
}