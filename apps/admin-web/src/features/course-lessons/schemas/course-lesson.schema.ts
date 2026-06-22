// src/features/course-lessons/schemas/course-lesson.schema.ts

import { z } from "zod";

import {
  COURSE_LESSON_DESCRIPTION_MAX_LENGTH,
  COURSE_LESSON_TITLE_MAX_LENGTH,
  COURSE_LESSON_VIDEO_URL_MAX_LENGTH,
} from "@/src/features/course-lessons/constants/course-lesson.constants";

export const courseLessonSchema =
  z.object({
    moduleId: z
      .string()
      .uuid("Please select a module."),

    title: z
      .string()
      .trim()
      .min(
        1,
        "Title is required.",
      )
      .max(
        COURSE_LESSON_TITLE_MAX_LENGTH,
        `Title cannot exceed ${COURSE_LESSON_TITLE_MAX_LENGTH} characters.`,
      ),

    description: z
      .string()
      .trim()
      .max(
        COURSE_LESSON_DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${COURSE_LESSON_DESCRIPTION_MAX_LENGTH} characters.`,
      ),

    videoUrl: z
      .string()
      .trim()
      .max(
        COURSE_LESSON_VIDEO_URL_MAX_LENGTH,
        `Video URL cannot exceed ${COURSE_LESSON_VIDEO_URL_MAX_LENGTH} characters.`,
      )
      .refine(
        (value) =>
          value === "" ||
          z.string().url().safeParse(value).success,
        {
          message:
            "Please enter a valid video URL.",
        },
      ),
  });

export type CourseLessonSchema =
  z.infer<
    typeof courseLessonSchema
  >;