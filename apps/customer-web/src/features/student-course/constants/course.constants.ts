import {
  CourseDurationType,
  CourseLevel,
  CourseStatus,
} from "@/src/features/student-course/types/course.types";

import {
  LessonResourceType,
} from "@/src/features/student-course/types/resource.types";

export const COURSE_ENDPOINTS = {
  GET_BY_ID: (
    courseId: string,
  ) => `/student/courses/${courseId}`,
} as const;

export const COURSE_DEFAULTS = {
  THUMBNAIL_ALT: "Course Thumbnail",

  LANGUAGE: "English",

  RATING: 0,

  REVIEWS: 0,
} as const;

export const COURSE_LEVEL_LABELS: Record<
  CourseLevel,
  string
> = {
  [CourseLevel.BEGINNER]:
    "Beginner",

  [CourseLevel.INTERMEDIATE]:
    "Intermediate",

  [CourseLevel.ADVANCED]:
    "Advanced",
};

export const COURSE_DURATION_LABELS: Record<
  CourseDurationType,
  string
> = {
  [CourseDurationType.DAYS]:
    "Days",

  [CourseDurationType.WEEKS]:
    "Weeks",

  [CourseDurationType.MONTHS]:
    "Months",

  [CourseDurationType.YEARS]:
    "Years",
};

export const COURSE_STATUS_LABELS: Record<
  CourseStatus,
  string
> = {
  [CourseStatus.ACTIVE]:
    "Active",

  [CourseStatus.DRAFT]:
    "Draft",

  [CourseStatus.INACTIVE]:
    "Inactive",

  [CourseStatus.ARCHIVED]:
    "Archived",
};

export const RESOURCE_TYPE_LABELS: Record<
  LessonResourceType,
  string
> = {
  [LessonResourceType.PDF]:
    "PDF",

  [LessonResourceType.DOC]:
    "Word",

  [LessonResourceType.DOCX]:
    "Word",

  [LessonResourceType.PPT]:
    "PowerPoint",

  [LessonResourceType.PPTX]:
    "PowerPoint",

  [LessonResourceType.XLS]:
    "Excel",

  [LessonResourceType.XLSX]:
    "Excel",

  [LessonResourceType.IMAGE]:
    "Image",

  [LessonResourceType.VIDEO]:
    "Video",

  [LessonResourceType.AUDIO]:
    "Audio",

  [LessonResourceType.ZIP]:
    "ZIP",

  [LessonResourceType.LINK]:
    "Link",

  [LessonResourceType.OTHER]:
    "File",
};