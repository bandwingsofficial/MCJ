import { z } from "zod";

import {
  COURSE_RESOURCE_FILE_URL_MAX_LENGTH,
  COURSE_RESOURCE_TITLE_MAX_LENGTH,
} from "@/src/features/course-resources/constants/course-resource.constants";

export const courseResourceSchema =
  z.object({
    lessonId: z
      .string()
      .uuid("Lesson is required."),

    title: z
      .string()
      .trim()
      .min(
        1,
        "Title is required.",
      )
      .max(
        COURSE_RESOURCE_TITLE_MAX_LENGTH,
        `Title cannot exceed ${COURSE_RESOURCE_TITLE_MAX_LENGTH} characters.`,
      ),

    type: z
      .string()
      .trim()
      .min(
        1,
        "Resource type is required.",
      ),

    fileUrl: z
  .string()
  .trim()
  .max(
    COURSE_RESOURCE_FILE_URL_MAX_LENGTH,
    `URL cannot exceed ${COURSE_RESOURCE_FILE_URL_MAX_LENGTH} characters.`,
  ),
  });

export type CourseResourceSchema =
  z.infer<
    typeof courseResourceSchema
  >;