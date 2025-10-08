import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  // Placeholder methods - will be implemented in future tasks
  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find();
  }

  async findOne(id: string): Promise<Course | null> {
    return this.coursesRepository.findOne({ where: { id } });
  }
}