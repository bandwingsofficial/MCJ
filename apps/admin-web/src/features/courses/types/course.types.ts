// src/features/courses/types/course.types.ts

export type CourseLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export type CourseMode =
  | "ONLINE"
  | "OFFLINE"
  | "RECORDED";

export type CourseQualification =
  | "B_COM"
  | "M_COM"
  | "BBA"
  | "MBA"
  | "BCA"
  | "MCA"
  | "CA"
  | "CA_FOUNDATION"
  | "CMA"
  | "CS"
  | "ACCA";

export type CourseDurationType =
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

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

  code: string;

  title: string;

  slug: string;

  tagline: string | null;

  shortDescription: string | null;

  description: string | null;

  thumbnailFileId: string | null;

  thumbnailUrl: string | null;

  pricing: CoursePricing;

  duration: number | null;

  durationType: CourseDurationType | null;

  level: CourseLevel;

  mode: CourseMode;

  minimumQualifications?: CourseQualification[];

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

  category?: CourseCategory | null;

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

  minimumQualifications?: CourseQualification[];

  modules?: CourseModuleTree[];

  moduleCount?: number;

  lessonCount?: number;

  previewLessonCount?: number;
}

export interface CourseListItem {
  id: string;

  code: string;

  title: string;

  slug: string;

  tagline: string | null;

  pricing: CoursePricing;

  isFree: boolean;

  level: CourseLevel;

  mode?: CourseMode;

  modes?: CourseMode[];

  minimumQualifications?: CourseQualification[];

  language: string;

  categoryId: string;

  category?: CourseCategory | null;

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

  total?: number;

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

  discountAmount?: number;

  discountedPrice?: number;

  currency?: string;

  isFree?: boolean;

  duration?: number;

  durationType?: CourseDurationType;

  level?: CourseLevel;

  modes?: CourseMode[];

  minimumQualifications?: CourseQualification[];

  language?: string;

  displayOrder?: number;

  slug?: string;

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

  discountAmount?: number;

  discountedPrice?: number;

  currency?: string;

  isFree?: boolean;

  duration?: number;

  durationType?: CourseDurationType;

  level?: CourseLevel;

  modes?: CourseMode[];

  minimumQualifications?: CourseQualification[];

  language?: string;

  displayOrder?: number;

  slug?: string;

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

  /** Optional for branch manage workspace callers. */
  branchId?: string;

  categoryId?: string;

  mode?: CourseMode;

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
