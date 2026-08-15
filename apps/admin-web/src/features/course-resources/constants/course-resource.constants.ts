import type {
  CourseResourceFilters,
  CourseResourceFormValues,
} from "@/src/features/course-resources/types";

/** Matches backend CreateCourseResourceDto @MaxLength(200). */
export const COURSE_RESOURCE_TITLE_MAX_LENGTH = 200;

export const COURSE_RESOURCE_FILE_URL_MAX_LENGTH = 2048;

export const COURSE_RESOURCE_TYPES = [
  { label: "PDF", value: "PDF" },
  { label: "Presentation", value: "PPT" },
  { label: "Document", value: "DOC" },
  { label: "Archive", value: "ZIP" },
  { label: "Image", value: "IMAGE" },
  { label: "Video", value: "VIDEO" },
  { label: "Link", value: "LINK" },
  { label: "Code", value: "CODE" },
  { label: "Other", value: "OTHER" },
] as const;

export type ResourceTypeValue =
  (typeof COURSE_RESOURCE_TYPES)[number]["value"];

export const DEFAULT_COURSE_RESOURCE_FILTERS: CourseResourceFilters = {
  lessonId: "",
  search: "",
  includeDeleted: false,
};

export const DEFAULT_COURSE_RESOURCE_FORM_VALUES: CourseResourceFormValues =
  {
    lessonId: "",
    title: "",
    type: "PDF",
    fileUrl: "",
  };
