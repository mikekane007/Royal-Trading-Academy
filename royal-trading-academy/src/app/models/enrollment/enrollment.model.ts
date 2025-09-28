export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number; // percentage 0-100
  lastAccessedAt: Date;
  certificateIssued: boolean;
  certificateUrl?: string;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  watchTime: number; // in seconds
  completedAt?: Date;
  notes?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  issuedAt: Date;
  certificateUrl: string;
  verificationCode: string;
}

export interface StudentDashboard {
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  enrolledCourses: EnrolledCourse[];
  recentActivity: Activity[];
  achievements: Achievement[];
  overallProgress: {
    totalCourses: number;
    completedCourses: number;
    totalHours: number;
    completedHours: number;
  };
}

export interface EnrolledCourse {
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    instructor: string;
    totalLessons: number;
  };
  enrollment: {
    progress: number;
    lastAccessedAt: Date;
    nextLesson?: {
      id: string;
      title: string;
    };
  };
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  courseId?: string;
  lessonId?: string;
}

export enum ActivityType {
  LESSON_COMPLETED = 'LESSON_COMPLETED',
  COURSE_ENROLLED = 'COURSE_ENROLLED',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  CERTIFICATE_EARNED = 'CERTIFICATE_EARNED',
  FORUM_POST = 'FORUM_POST'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
  category: AchievementCategory;
}

export enum AchievementCategory {
  COMPLETION = 'COMPLETION',
  ENGAGEMENT = 'ENGAGEMENT',
  STREAK = 'STREAK',
  MILESTONE = 'MILESTONE'
}