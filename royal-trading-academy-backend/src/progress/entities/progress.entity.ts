import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('progress')
@Unique(['userId', 'lessonId'])
export class Progress extends BaseEntity {
  @Column({ default: false })
  completed: boolean;

  @Column({ default: 0 })
  watchTime: number; // in seconds

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  completionPercentage: number; // 0-100

  @Column({ nullable: true })
  completedAt: Date;

  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-json', { nullable: true })
  quizAnswers: any; // For quiz lessons

  @Column({ nullable: true })
  quizScore: number; // 0-100

  @Column({ nullable: true })
  assignmentSubmission: string; // URL or text

  @Column({ nullable: true })
  assignmentGrade: number; // 0-100

  @Column('text', { nullable: true })
  instructorFeedback: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.progress)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: string;
}