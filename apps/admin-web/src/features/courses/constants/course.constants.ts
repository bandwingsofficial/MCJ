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

export const COURSE_QUALIFICATIONS = [
  "B_COM",
  "M_COM",
  "BBA",
  "MBA",
  "BCA",
  "MCA",
  "CA",
  "CA_FOUNDATION",
  "CMA",
  "CS",
  "ACCA",
] as const satisfies readonly CourseQualification[];

export const COURSE_QUALIFICATION_LABELS: Record<
  CourseQualification,
  string
> = {
  B_COM: "B.Com",
  M_COM: "M.Com",
  BBA: "BBA",
  MBA: "MBA",
  BCA: "BCA",
  MCA: "MCA",
  CA: "CA",
  CA_FOUNDATION: "CA Foundation",
  CMA: "CMA",
  CS: "CS",
  ACCA: "ACCA",
};

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
