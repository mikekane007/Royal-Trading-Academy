import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonResource } from './entities/lesson-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonResource])],
  exports: [TypeOrmModule],
})
export class LessonsModule {}