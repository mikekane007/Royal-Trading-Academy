import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateForumCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsOptional()
  isActive?: boolean = true;
}