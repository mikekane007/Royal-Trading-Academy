import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Lesson } from './lesson.entity';

export enum ResourceType {
  PDF = 'pdf',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  IMAGE = 'image',
  LINK = 'link',
  CODE = 'code',
}

@Entity('lesson_resources')
export class LessonResource extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  type: ResourceType;

  @Column()
  url: string;

  @Column({ nullable: true })
  fileSize: number; // in bytes

  @Column({ default: true })
  isDownloadable: boolean;

  @Column()
  orderIndex: number;

  // Relationships
  @ManyToOne(() => Lesson, (lesson) => lesson.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: string;
}