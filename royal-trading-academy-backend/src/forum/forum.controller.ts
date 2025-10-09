import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumCategoryDto } from './dto/create-forum-category.dto';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { ForumQueryDto } from './dto/forum-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('forum')
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // Category endpoints
  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async createCategory(@Body() createCategoryDto: CreateForumCategoryDto) {
    return await this.forumService.createCategory(createCategoryDto);
  }

  @Get('categories')
  async findAllCategories() {
    return await this.forumService.findAllCategories();
  }

  @Get('categories/:id')
  async findCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.forumService.findCategoryById(id);
  }

  // Thread endpoints
  @Post('threads')
  async createThread(
    @Body() createThreadDto: CreateForumThreadDto,
    @CurrentUser() user: User,
  ) {
    return await this.forumService.createThread(createThreadDto, user);
  }

  @Get('threads')
  async findThreads(@Query() queryDto: ForumQueryDto) {
    return await this.forumService.findThreads(queryDto);
  }

  @Get('threads/:id')
  async findThreadById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.forumService.findThreadById(id);
  }

  @Put('threads/:id')
  async updateThread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<CreateForumThreadDto>,
    @CurrentUser() user: User,
  ) {
    return await this.forumService.updateThread(id, updateData, user);
  }

  @Delete('threads/:id')
  async deleteThread(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.forumService.deleteThread(id, user);
    return { message: 'Thread deleted successfully' };
  }

  // Post endpoints
  @Post('posts')
  async createPost(
    @Body() createPostDto: CreateForumPostDto,
    @CurrentUser() user: User,
  ) {
    return await this.forumService.createPost(createPostDto, user);
  }

  @Get('threads/:threadId/posts')
  async findPostsByThread(
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.forumService.findPostsByThread(threadId, page, limit);
  }

  @Put('posts/:id')
  async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return await this.forumService.updatePost(id, content, user);
  }

  @Delete('posts/:id')
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.forumService.deletePost(id, user);
    return { message: 'Post deleted successfully' };
  }

  // Moderation endpoints
  @Put('posts/:id/moderate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async moderatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moderationData: { isHidden: boolean; moderationReason?: string },
  ) {
    return await this.forumService.moderatePost(
      id,
      moderationData.isHidden,
      moderationData.moderationReason,
    );
  }

  @Put('threads/:id/moderate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async moderateThread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moderationData: {
      isLocked?: boolean;
      isPinned?: boolean;
      isHidden?: boolean;
    },
  ) {
    return await this.forumService.moderateThread(
      id,
      moderationData.isLocked,
      moderationData.isPinned,
      moderationData.isHidden,
    );
  }
}