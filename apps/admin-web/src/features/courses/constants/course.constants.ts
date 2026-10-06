import {
  COURSE_MINIMUM_QUALIFICATION_GROUPS,
  COURSE_MINIMUM_QUALIFICATION_LABELS,
  COURSE_MINIMUM_QUALIFICATION_VALUES,
} from "@mcj/shared-constants";

import type {
  CourseLevel,
  CourseQualification,
  CourseStatus,
} from "@/src/features/courses/types/course.types";

export const COURSE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const satisfies readonly CourseLevel[];

export const COURSE_QUALIFICATIONS = COURSE_MINIMUM_QUALIFICATION_VALUES;

export const COURSE_QUALIFICATION_LABELS: Record<
  CourseQualification,
  string
> = COURSE_MINIMUM_QUALIFICATION_LABELS;

export const COURSE_QUALIFICATION_GROUPS = COURSE_MINIMUM_QUALIFICATION_GROUPS;

export const COURSE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const satisfies readonly CourseStatus[];

export const DEFAULT_COURSE_PAGE_SIZE = 20;

export const DEFAULT_COURSE_FILTERS = {
  search: "",

  categoryId: undefined,

  status: undefined,

  page: 1,

  pageSize: DEFAULT_COURSE_PAGE_SIZE,
};
