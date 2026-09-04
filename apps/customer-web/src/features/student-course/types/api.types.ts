/**
 * Backend API DTOs for Student Course.
 * These interfaces mirror the backend response shape.
 * Never expose these types outside the API and mapper layers.
 */

export interface LessonResourceResponseDto {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  displayOrder: number;
}

export interface LessonResponseDto {
  id: string;
  title: string;
  videoUrl: string | null;
  duration: number | null;
  displayOrder: number;
  resources: LessonResourceResponseDto[];
}

export interface CourseModuleResponseDto {
  id: string;
  title: string;
  description: string | null;
  keySkills: string[];
  displayOrder: number;
  lessons: LessonResponseDto[];
}

export interface CourseBranchResponseDto {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface StudentCourseResponseDto {
  id: string;
  code?: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  thumbnailFileId: string | null;
  thumbnailUrl: string | null;
  duration: number;
  durationType: string;
  level: string;
  language: string;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isPopular: boolean;
  displayOrder: number | null;
  metaTitle: string;
  metaDescription: string | null;
  metaKeywords: string;
  categoryId: string;
  branches: CourseBranchResponseDto[];
  status: string;
  images: [];
  materials: [];
  modules: CourseModuleResponseDto[];
  previewModules?: CourseModuleResponseDto[];
  moduleCount?: number;
  lessonCount?: number;
  createdBy: string;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCourseProgressItemDto {
  lessonId: string;
  isCompleted: boolean;
  watchedSeconds: number;
  completedAt: string | null;
}

export interface StudentCourseProgressDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  items: StudentCourseProgressItemDto[];
}

export interface StudentCoursePayloadDto {
  course: StudentCourseResponseDto;
  progress: StudentCourseProgressDto;
}
