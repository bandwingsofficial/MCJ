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
  originalPrice: number;
  discountPrice: number;
  totalDiscount: number;
  currency: string;
  isFree: boolean;
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
  originalPrice: number;
  discountPrice: number;
  totalDiscount: number;
  currency: string;
  isFree: boolean;
  duration: number | null;
  durationType: string | null;
  level: CourseLevel;
  mode: CourseMode;
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
}

export interface GetCoursesParams {
  search?: string;
  categoryId?: string;
  branchId?: string;
  isFeatured?: boolean;
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
