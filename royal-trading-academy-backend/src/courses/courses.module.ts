import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { CourseReview } from './entities/course-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseReview])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}