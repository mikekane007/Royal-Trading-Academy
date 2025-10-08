import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progress])],
  exports: [TypeOrmModule],
})
export class ProgressModule {}