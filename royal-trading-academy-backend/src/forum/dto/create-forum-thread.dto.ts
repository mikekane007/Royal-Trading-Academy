import { IsString, IsNotEmpty, IsUUID, MaxLength, IsOptional } from 'class-validator';

export class CreateForumThreadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsOptional()
  isPinned?: boolean = false;

  @IsOptional()
  isLocked?: boolean = false;
}