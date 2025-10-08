import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Course } from '../../courses/entities/course.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { LessonResource } from './lesson-resource.entity';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  LIVE_SESSION = 'live_session',
}

@Entity('lessons')
export class Lesson extends BaseEntity {
  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.VIDEO,
  })
  type: LessonType;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  duration: number; // in seconds

  @Column()
  orderIndex: number;

  @Column({ default: false })
  isPreview: boolean; // Free preview lesson

  @Column({ default: true })
  isPublished: boolean;

  @Column('simple-json', { nullable: true })
  quizData: any; // For quiz lessons

  @Column({ nullable: true })
  assignmentInstructions: string;

  @Column({ nullable: true })
  liveSessionUrl: string;

  @Column({ nullable: true })
  liveSessionDate: Date;

  // Relationships
  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;

  @OneToMany(() => Progress, (progress) => progress.lesson)
  progress: Progress[];

  @OneToMany(() => LessonResource, (resource) => resource.lesson, { cascade: true })
  resources: LessonResource[];
}