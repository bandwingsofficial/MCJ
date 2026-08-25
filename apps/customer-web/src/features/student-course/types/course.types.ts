import type { CoursePricing } from "@/src/features/courses/types/course.types";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

/**
 * Supported course levels.
 * Keep synchronized with backend enum values.
 */
export enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

/**
 * Course duration units.
 */
export enum CourseDurationType {
  DAYS = "DAYS",
  WEEKS = "WEEKS",
  MONTHS = "MONTHS",
  YEARS = "YEARS",
}

/**
 * Course lifecycle status.
 */
export enum CourseStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

/**
 * Branch where the course is available.
 */
export interface CourseBranch {
  id: string;
  branchName: string;
  branchCode: string;
}

/**
 * Represents the complete course domain model
 * used throughout the Student LMS.
 */
export interface StudentCourse {
  /**
   * Unique course identifier.
   */
  id: string;

  /**
   * Course code shown to students.
   */
  code: string;

  /**
   * Course title.
   */
  title: string;

  /**
   * SEO-friendly course slug.
   */
  slug: string;

  /**
   * Short marketing tagline.
   */
  tagline: string | null;

  /**
   * Short description shown in listings.
   */
  shortDescription: string | null;

  /**
   * Full course description.
   */
  description: string | null;

  /**
   * Course thumbnail.
   */
  thumbnailUrl: string | null;

  pricing: CoursePricing;

  /**
   * Course duration value.
   */
  duration: number;

  /**
   * Duration unit.
   */
  durationType: CourseDurationType;

  /**
   * Course difficulty.
   */
  level: CourseLevel;

  /**
   * Teaching language.
   */
  language: string;

  /**
   * Student rating.
   */
  averageRating: number;

  /**
   * Total reviews.
   */
  totalReviews: number;

  /**
   * Featured course.
   */
  isFeatured: boolean;

  /**
   * Popular course.
   */
  isPopular: boolean;

  /**
   * SEO metadata.
   */
  metaTitle: string;

  metaDescription: string | null;

  metaKeywords: string[];

  /**
   * Category.
   */
  categoryId: string;

  /**
   * Available branches.
   */
  branches: CourseBranch[];

  /**
   * Current status.
   */
  status: CourseStatus;

  /**
   * Learning modules.
   * Sorted by displayOrder by the mapper.
   */
  modules: CourseModule[];

  moduleCount: number;

  lessonCount: number;

  /**
   * Audit fields.
   */
  createdAt: string;

  updatedAt: string;
}