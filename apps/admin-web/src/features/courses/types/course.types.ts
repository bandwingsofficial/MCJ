// src/features/courses/types/course.types.ts

export type CourseLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export type CourseMode =
  | "ONLINE"
  | "OFFLINE"
  | "HYBRID";

export type CourseDurationType =
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

export type CourseStatus =
  | "DRAFT"
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export interface Course {
  id: string;

  title: string;

  slug: string;

  tagline: string | null;

  shortDescription: string | null;

  description: string | null;

  thumbnailFileId: string | null;

  thumbnailUrl: string | null;

  originalPrice: number;

  discountPrice: number;

  totalDiscount: number;

  currency: string;

  isFree: boolean;

  duration: number | null;

  durationType: CourseDurationType | null;

  level: CourseLevel;

  mode: CourseMode;

  language: string;

  averageRating: number;

  totalReviews: number;

  isFeatured: boolean;

  isPopular: boolean;

  displayOrder: number;

  metaTitle: string | null;

  metaDescription: string | null;

  metaKeywords: string | null;

  categoryId: string;

  branchId: string | null;

  status: CourseStatus;

  images: string[];

  materials: string[];

  createdAt: string;

  updatedAt: string;
}

export interface CourseDetails
  extends Course {
  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;
}

export interface CourseListItem {
  id: string;

  title: string;

  slug: string;

  tagline: string | null;

  originalPrice: number;

  discountPrice: number;

  totalDiscount: number;

  isFree: boolean;

  level: CourseLevel;

  mode: CourseMode;

  language: string;

  categoryId: string;

  branchId: string | null;

  status: CourseStatus;

  displayOrder: number;

  createdAt: string;

  updatedAt: string;
}

export interface CourseListResponse {
  items: CourseListItem[];

  count: number;
}

export interface CreateCourseRequest {
  title: string;

  tagline?: string;

  shortDescription?: string;

  description?: string;

  originalPrice?: number;

  discountPrice?: number;

  currency?: string;

  isFree?: boolean;

  duration?: number;

  durationType?: CourseDurationType;

  level?: CourseLevel;

  mode?: CourseMode;

  language?: string;

  displayOrder?: number;

  metaTitle?: string;

  metaDescription?: string;

  metaKeywords?: string;

  categoryId: string;

  branchId?: string;
}

export interface UpdateCourseRequest {
  title?: string;

  tagline?: string;

  shortDescription?: string;

  description?: string;

  originalPrice?: number;

  discountPrice?: number;

  currency?: string;

  isFree?: boolean;

  duration?: number;

  durationType?: CourseDurationType;

  level?: CourseLevel;

  mode?: CourseMode;

  language?: string;

  displayOrder?: number;

  metaTitle?: string;

  metaDescription?: string;

  metaKeywords?: string;

  categoryId?: string;

  branchId?: string;
}

export interface CourseFilters {
  search: string;

  includeDeleted: boolean;

  status?: CourseStatus;

  skip: number;

  take: number;
}

export interface ApiSuccessResponse<T> {
  success: true;

  message: string;

  data: T;
}

export interface ApiErrorResponse {
  success: false;

  code: string;

  message?: string;

  errors?: Record<
    string,
    string[]
  >;

  meta?: Record<
    string,
    string
  >;
}

export interface ActivateCourseResponse {
  id: string;

  status: "ACTIVE";

  updatedAt: string;
}

export interface DeactivateCourseResponse {
  id: string;

  status: "INACTIVE";

  updatedAt: string;
}

export interface RestoreCourseResponse {
  id: string;

  status:
    | "ACTIVE"
    | "DRAFT";

  updatedAt: string;
}

export interface DeleteCourseResponse {
  id: string;

  deleted: boolean;

  deletedAt: string;
}

export interface PermanentDeleteCourseResponse {
  id: string;

  permanentlyDeleted: boolean;
}