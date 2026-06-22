import type {
  CourseResourceFilters,
  CourseResourceFormValues,
} from "@/src/features/course-resources/types";

export const COURSE_RESOURCE_TITLE_MAX_LENGTH =
  150;

export const COURSE_RESOURCE_FILE_URL_MAX_LENGTH =
  500;

export const COURSE_RESOURCE_TYPES = [
  {
    label: "PDF",
    value: "PDF",
  },
  {
    label: "Video",
    value: "VIDEO",
  },
  {
    label: "Document",
    value: "DOCUMENT",
  },
  {
    label: "Link",
    value: "LINK",
  },
] as const;

export const DEFAULT_COURSE_RESOURCE_FILTERS: CourseResourceFilters =
  {
    lessonId: "",
    includeDeleted: false,
  };

export const DEFAULT_COURSE_RESOURCE_FORM_VALUES: CourseResourceFormValues =
  {
    lessonId: "",
    title: "",
    type: "PDF",
    fileUrl: "",
  };