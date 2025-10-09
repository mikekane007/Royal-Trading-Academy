import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { ForumCategory } from './entities/forum-category.entity';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumPost } from './entities/forum-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForumCategory, ForumThread, ForumPost]),
  ],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService, TypeOrmModule],
})
export class ForumModule {}