import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { ForumCategory } from './entities/forum-category.entity';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumPost, PostStatus } from './entities/forum-post.entity';
import { CreateForumCategoryDto } from './dto/create-forum-category.dto';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { ForumQueryDto } from './dto/forum-query.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(ForumCategory)
    private forumCategoryRepository: Repository<ForumCategory>,
    @InjectRepository(ForumThread)
    private forumThreadRepository: Repository<ForumThread>,
    @InjectRepository(ForumPost)
    private forumPostRepository: Repository<ForumPost>,
  ) {}

  // Category methods
  async createCategory(createCategoryDto: CreateForumCategoryDto): Promise<ForumCategory> {
    const category = this.forumCategoryRepository.create(createCategoryDto);
    return await this.forumCategoryRepository.save(category);
  }

  async findAllCategories(): Promise<ForumCategory[]> {
    return await this.forumCategoryRepository.find({
      where: { isActive: true },
      relations: ['threads'],
      order: { createdAt: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<ForumCategory> {
    const category = await this.forumCategoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['threads', 'threads.author', 'threads.posts'],
    });

    if (!category) {
      throw new NotFoundException('Forum category not found');
    }

    return category;
  }

  // Thread methods
  async createThread(createThreadDto: CreateForumThreadDto, author: User): Promise<ForumThread> {
    const category = await this.findCategoryById(createThreadDto.categoryId);
    
    const thread = this.forumThreadRepository.create({
      ...createThreadDto,
      author,
      category,
    });

    return await this.forumThreadRepository.save(thread);
  }

  async findThreads(queryDto: ForumQueryDto): Promise<{ threads: ForumThread[]; total: number }> {
    const { page = 1, limit = 10, search, categoryId, courseId, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.forumThreadRepository
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.author', 'author')
      .leftJoinAndSelect('thread.category', 'category')
      .leftJoinAndSelect('thread.posts', 'posts')
      .leftJoinAndSelect('posts.author', 'postAuthor');

    if (search) {
      queryBuilder.andWhere(
        '(thread.title ILIKE :search OR thread.content ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('thread.categoryId = :categoryId', { categoryId });
    }

    if (courseId) {
      queryBuilder.andWhere('thread.courseId = :courseId', { courseId });
    }

    queryBuilder
      .orderBy(`thread.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [threads, total] = await queryBuilder.getManyAndCount();

    return { threads, total };
  }

  async findThreadById(id: string): Promise<ForumThread> {
    const thread = await this.forumThreadRepository.findOne({
      where: { id },
      relations: [
        'author',
        'category',
        'posts',
        'posts.author',
        'posts.parentPost',
        'posts.replies',
      ],
    });

    if (!thread) {
      throw new NotFoundException('Forum thread not found');
    }

    // Increment view count
    thread.viewCount += 1;
    await this.forumThreadRepository.save(thread);

    return thread;
  }

  async updateThread(id: string, updateData: Partial<ForumThread>, user: User): Promise<ForumThread> {
    const thread = await this.findThreadById(id);

    if (thread.author.id !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.INSTRUCTOR) {
      throw new ForbiddenException('You can only edit your own threads');
    }

    Object.assign(thread, updateData);
    return await this.forumThreadRepository.save(thread);
  }

  async deleteThread(id: string, user: User): Promise<void> {
    const thread = await this.findThreadById(id);

    if (thread.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own threads');
    }

    await this.forumThreadRepository.remove(thread);
  }

  // Post methods
  async createPost(createPostDto: CreateForumPostDto, author: User): Promise<ForumPost> {
    const thread = await this.findThreadById(createPostDto.threadId);

    if (thread.isLocked && author.role !== UserRole.ADMIN && author.role !== UserRole.INSTRUCTOR) {
      throw new ForbiddenException('This thread is locked');
    }

    let parentPost = null;
    if (createPostDto.parentPostId) {
      parentPost = await this.forumPostRepository.findOne({
        where: { id: createPostDto.parentPostId },
      });
    }

    const post = this.forumPostRepository.create({
      ...createPostDto,
      authorId: author.id,
      threadId: thread.id,
      parentPostId: createPostDto.parentPostId,
    });

    const savedPost = await this.forumPostRepository.save(post);

    // Update thread's last activity
    thread.updatedAt = new Date();
    await this.forumThreadRepository.save(thread);

    return savedPost;
  }

  async findPostsByThread(threadId: string, page: number = 1, limit: number = 20): Promise<{ posts: ForumPost[]; total: number }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await this.forumPostRepository.findAndCount({
      where: { threadId: threadId, parentPostId: null },
      relations: ['author', 'replies', 'replies.author'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return { posts, total };
  }

  async updatePost(id: string, content: string, user: User): Promise<ForumPost> {
    const post = await this.forumPostRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Forum post not found');
    }

    if (post.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    post.content = content;
    return await this.forumPostRepository.save(post);
  }

  async deletePost(id: string, user: User): Promise<void> {
    const post = await this.forumPostRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Forum post not found');
    }

    if (post.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.forumPostRepository.remove(post);
  }

  // Moderation methods
  async moderatePost(id: string, isHidden: boolean, moderationReason?: string): Promise<ForumPost> {
    const post = await this.forumPostRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Forum post not found');
    }

    if (isHidden !== undefined) {
      post.status = isHidden ? PostStatus.HIDDEN : PostStatus.PUBLISHED;
    }
    if (moderationReason) {
      post.moderationReason = moderationReason;
    }
    return await this.forumPostRepository.save(post);
  }

  async moderateThread(id: string, isLocked?: boolean, isPinned?: boolean, isHidden?: boolean): Promise<ForumThread> {
    const thread = await this.findThreadById(id);

    if (isLocked !== undefined) thread.isLocked = isLocked;
    if (isPinned !== undefined) thread.isSticky = isPinned;

    return await this.forumThreadRepository.save(thread);
  }
}