import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CourseDifficulty, CourseCategory, CourseStatus } from '../entities/course.entity';

export class CourseQueryDto {
  @ApiPropertyOptional({ description: 'Search term for course title or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: CourseCategory })
  @IsEnum(CourseCategory)
  @IsOptional()
  category?: CourseCategory;

  @ApiPropertyOptional({ description: 'Filter by difficulty', enum: CourseDifficulty })
  @IsEnum(CourseDifficulty)
  @IsOptional()
  difficulty?: CourseDifficulty;

  @ApiPropertyOptional({ description: 'Filter by status', enum: CourseStatus })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiPropertyOptional({ description: 'Filter by instructor ID' })
  @IsString()
  @IsOptional()
  instructorId?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by tags (comma-separated)' })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional({ description: 'Show only featured courses' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['title', 'price', 'rating', 'createdAt', 'enrollmentCount'] })
  @IsString()
  @IsOptional()
  sortBy?: 'title' | 'price' | 'rating' | 'createdAt' | 'enrollmentCount';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}