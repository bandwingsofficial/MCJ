// src/features/courses/types/course.types.ts

export type CourseLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export type CourseMode =
  | "ONLINE"
  | "OFFLINE"
  | "HYBRID";

export type CourseStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DRAFT"
  | "ARCHIVED";

export interface CoursePricing {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
}

export interface CourseBranch {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface CoursePreviewLesson {
  id: string;
  title: string;
  displayOrder: number;
  duration: number | null;
  isPreview: boolean;
}

export interface CoursePreviewModule {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  keySkills?: string[];
  lessons: CoursePreviewLesson[];
}

export interface CourseDto {
  id: string;
  code?: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  pricing: CoursePricing;
  duration: number | null;
  durationType: string | null;
  level: CourseLevel;
  modes?: CourseMode[];
  mode?: CourseMode;
  language: string;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isPopular: boolean;
  categoryId?: string;
  category?: CourseCategory | null;
  branches?: CourseBranch[];
  status?: CourseStatus;
  previewModules?: CoursePreviewModule[];
  moduleCount?: number;
  lessonCount?: number;
  isEnrolled?: boolean | null;
  isAdmitted?: boolean | null;
  previewLessonCount?: number;
  updatedAt?: string;
}

export interface CourseSummary {
  courseId: string;
  batches: number;
  students: number;
  instructors: number;
  branches: number;
  modules: number;
  lessons: number;
  quizzes: number;
}

export interface GetCourseSummaryResponse {
  success: boolean;
  message: string;
  data: CourseSummary;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  pricing: CoursePricing;
  duration: number | null;
  durationType: string | null;
  level: CourseLevel;
  mode: CourseMode;
  modes: CourseMode[];
  language: string;
  averageRating: number;
  totalReviews: number;
  categoryId: string;
  categoryName: string;
  branches: CourseBranch[];
  isFeatured: boolean;
  previewModules: CoursePreviewModule[];
  moduleCount: number;
  lessonCount: number;
  previewLessonCount: number;
  isEnrolled: boolean | null;
  isAdmitted: boolean | null;
  updatedAt: string | null;
  status: CourseStatus | null;
}

export interface GetCoursesParams {
  search?: string;
  categoryId?: string;
  branchId?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
}

export interface GetCoursesResponse {
  success: boolean;
  message: string;
  data: {
    items: CourseDto[];
    total: number;
  };
}

export interface GetCourseResponse {
  success: boolean;
  message: string;
  data: CourseDto;
}
