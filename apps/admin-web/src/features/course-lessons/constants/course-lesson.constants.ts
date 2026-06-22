// src/features/course-lessons/constants/course-lesson.constants.ts

import type {
  CourseLessonFilters,
  CourseLessonFormValues,
} from "@/src/features/course-lessons/types";

export const COURSE_LESSON_TITLE_MAX_LENGTH =
  150;

export const COURSE_LESSON_DESCRIPTION_MAX_LENGTH =
  1000;

export const COURSE_LESSON_VIDEO_URL_MAX_LENGTH =
  500;

export const DEFAULT_COURSE_LESSON_FILTERS = {
  search: "",
  courseId: "",
  moduleId: undefined,
  includeDeleted: false,
};

export const DEFAULT_COURSE_LESSON_FORM_VALUES: CourseLessonFormValues =
  {
    moduleId: "",
    title: "",
    description: "",
    videoUrl: "",
  };