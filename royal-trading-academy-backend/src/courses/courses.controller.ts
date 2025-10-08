import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }
}