export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  difficulty: Difficulty;
  level: string; // Added for compatibility
  duration: number; // in hours
  instructor: CourseInstructor;
  thumbnailUrl: string;
  imageUrl: string; // Added for compatibility
  previewVideoUrl?: string;
  category: CourseCategory;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrollmentCount: number;
  rating: number;
  lessons: Lesson[];
  totalLessons: number; // Added for compatibility
}

export interface CourseInstructor {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  credentials: string[];
  yearsExperience: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in seconds
  orderIndex: number;
  resources: LessonResource[];
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  type: ResourceType;
  url: string;
  fileSize?: number;
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum CourseCategory {
  FOREX = 'FOREX',
  STOCKS = 'STOCKS',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  OPTIONS = 'OPTIONS',
  DAY_TRADING = 'DAY_TRADING',
  TECHNICAL_ANALYSIS = 'TECHNICAL_ANALYSIS',
  RISK_MANAGEMENT = 'RISK_MANAGEMENT',
  TRADING_PSYCHOLOGY = 'TRADING_PSYCHOLOGY'
}

export enum ResourceType {
  PDF = 'PDF',
  SPREADSHEET = 'SPREADSHEET',
  PRESENTATION = 'PRESENTATION',
  TEMPLATE = 'TEMPLATE',
  LINK = 'LINK'
}