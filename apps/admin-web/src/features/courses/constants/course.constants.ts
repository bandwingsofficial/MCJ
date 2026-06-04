import type {
  CourseDurationType,
  CourseLevel,
  CourseMode,
  CourseStatus,
} from "@/src/features/courses/types/course.types";

export const COURSE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const satisfies readonly CourseLevel[];

export const COURSE_MODES = [
  "ONLINE",
  "OFFLINE",
  "HYBRID",
] as const satisfies readonly CourseMode[];

export const COURSE_DURATION_TYPES =
  [
    "DAYS",
    "WEEKS",
    "MONTHS",
    "YEARS",
  ] as const satisfies readonly CourseDurationType[];

export const COURSE_STATUSES =
  [
    "DRAFT",
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
  ] as const satisfies readonly CourseStatus[];

export const DEFAULT_COURSE_FILTERS =
  {
    search: "",

    includeDeleted: false,

    status: undefined,

    skip: 0,

    take: 10,
  };