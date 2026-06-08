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
  | "INACTIVE";

export interface CourseDto {
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
  durationType: string | null;

  level: CourseLevel;
  mode: CourseMode;

  language: string;

  averageRating: number;
  totalReviews: number;

  isFeatured: boolean;
  isPopular: boolean;

  displayOrder: number;

  categoryId: string;
  branchId: string | null;

  status: CourseStatus;

  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;

  title: string;
  slug: string;

  tagline: string | null;

  shortDescription: string | null;

  thumbnailUrl: string | null;

  originalPrice: number;

  discountPrice: number;

  totalDiscount: number;

  currency: string;

  isFree: boolean;

  level: CourseLevel;

  mode: CourseMode;

  language: string;

  averageRating: number;

  totalReviews: number;

  categoryId: string;

  isFeatured: boolean;
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

  data: CourseDto[];
}

export interface GetCourseResponse {
  success: boolean;

  message: string;

  data: CourseDto;
}