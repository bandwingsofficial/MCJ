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

export type CourseFilterStatus =
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

export interface CourseBranch {
  id: string;

  branchName: string;

  branchCode: string;
}

export interface CourseResourceTree {
  id: string;

  title: string;

  type: string;

  fileUrl: string | null;

  displayOrder: number;
}

export interface CourseLessonQuizTree {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  passingScore: number | null;
  timeLimitMinutes: number | null;
}

export interface CourseLessonTree {
  id: string;

  title: string;

  videoUrl: string | null;

  duration: number | null;

  displayOrder: number;

  isPreview: boolean;

  resources: CourseResourceTree[];

  quiz?: CourseLessonQuizTree | null;
}

export interface CourseModuleTree {
  id: string;

  title: string;

  description: string | null;

  keySkills: string[];

  displayOrder: number;

  lessons: CourseLessonTree[];
}

export interface CourseDetails
  extends Course {
  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  branches?: CourseBranch[];

  categoryName?: string | null;

  modes?: CourseMode[];

  modules?: CourseModuleTree[];

  moduleCount?: number;

  lessonCount?: number;

  previewLessonCount?: number;
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

  mode?: CourseMode;

  modes?: CourseMode[];

  language: string;

  categoryId: string;

  categoryName?: string | null;

  branchId: string | null;

  status: CourseStatus;

  duration?: number | null;

  durationType?: CourseDurationType | null;

  displayOrder?: number | null;

  isDeleted?: boolean;

  deletedAt?: string | null;

  createdAt: string;

  updatedAt: string;

  thumbnailFileId: string | null;

  thumbnailUrl: string | null;
}

export interface CourseListResponse {
  items: CourseListItem[];

  count: number;

  meta?: {
    total: number;
    skip: number;
    take: number;
  };
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

  modes?: CourseMode[];

  language?: string;

  displayOrder?: number;

  metaTitle?: string;

  metaDescription?: string;

  metaKeywords?: string;

  categoryId: string;

  branchIds?: string[];

  status?: CourseStatus;

  materialsMeta?: string;
  thumbnailFileId?: string;
}

export interface UpdateCourseRequest {
  title?: string;

  tagline?: string;

  shortDescription?: string;

  description?: string;

  originalPrice?: number;
  thumbnailFileId?: string;

  discountPrice?: number;

  currency?: string;

  isFree?: boolean;

  duration?: number;

  durationType?: CourseDurationType;

  level?: CourseLevel;

  modes?: CourseMode[];

  language?: string;

  displayOrder?: number;

  metaTitle?: string;

  metaDescription?: string;

  metaKeywords?: string;

  categoryId?: string;

  branchIds?: string[];

  status?: CourseStatus;

  isFeatured?: boolean;

  isPopular?: boolean;

  materialsMeta?: string;
}

export interface CourseFilters {
  search?: string;

  categoryId?: string;

  /** Optional for branch manage workspace callers. */
  branchId?: string;

  level?: CourseLevel;

  status?: CourseFilterStatus;

  page?: number;

  pageSize?: number;
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

export interface BulkCourseItemResult {
  courseId: string;
  success: boolean;
  message: string;
  status?: CourseStatus;
}

export interface BulkCourseOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkCourseItemResult[];
  failures: BulkCourseItemResult[];
}
