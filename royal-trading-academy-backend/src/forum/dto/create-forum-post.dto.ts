import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateForumPostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  threadId: string;

  @IsUUID()
  @IsOptional()
  parentPostId?: string;
}