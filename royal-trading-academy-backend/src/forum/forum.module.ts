import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumCategory } from './entities/forum-category.entity';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumPost } from './entities/forum-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForumCategory, ForumThread, ForumPost])],
  exports: [TypeOrmModule],
})
export class ForumModule {}