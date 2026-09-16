import { z } from "zod";

import {
  COURSE_LEVELS,
  COURSE_QUALIFICATIONS,
} from "@/src/features/courses/constants/course.constants";
import {
  COURSE_CHAR_LIMITS,
  COURSE_WORD_LIMITS,
  wordLimitRefine,
} from "@/src/features/courses/utils/course-form-validation";

const optionalTrimmedString = z.string().trim();

const courseFields = {
  title: z
    .string()
    .trim()
    .min(1, "Course title is required.")
    .max(
      COURSE_CHAR_LIMITS.title,
      `Maximum ${COURSE_CHAR_LIMITS.title} characters allowed`,
    ),

  thumbnailFileId: z.string().optional(),

  tagline: z
    .string()
    .trim()
    .max(
      COURSE_CHAR_LIMITS.tagline,
      `Maximum ${COURSE_CHAR_LIMITS.tagline} characters allowed`,
    )
    .optional()
    .or(z.literal("")),

  shortDescription: optionalTrimmedString
    .optional()
    .refine(
      (value) =>
        !value || wordLimitRefine(COURSE_WORD_LIMITS.shortDescription)(value),
      {
        message: `Short description must not exceed ${COURSE_WORD_LIMITS.shortDescription} words.`,
      },
    ),

  description: optionalTrimmedString
    .optional()
    .refine(
      (value) =>
        !value || wordLimitRefine(COURSE_WORD_LIMITS.description)(value),
      {
        message: `Description must not exceed ${COURSE_WORD_LIMITS.description} words.`,
      },
    ),

  categoryId: z
    .string()
    .min(1, "Please select a category.")
    .uuid("Please select a category."),

  level: z.enum(COURSE_LEVELS).default("BEGINNER"),

  minimumQualifications: z
    .array(z.enum(COURSE_QUALIFICATIONS))
    .default([]),

  language: z
    .string()
    .trim()
    .min(2, "Language is required"),

  averageRating: z
    .number({
      error: "Rating is required",
    })
    .min(0, "Rating must be between 0 and 5.")
    .max(5, "Rating must be between 0 and 5.")
    .refine(
      (value) => Math.round(value * 100) === value * 100,
      {
        message: "Rating must have at most 2 decimal places.",
      },
    )
    .default(0),

  totalReviews: z
    .number({
      error: "Rating count is required",
    })
    .int("Rating count must be a whole number.")
    .min(0, "Rating count cannot be negative.")
    .default(0),

  slug: z
    .string()
    .trim()
    .max(180, "Maximum 180 characters allowed")
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        !value ||
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      {
        message: "Slug must use lowercase letters, numbers, and hyphens only",
      },
    ),

  displayOrder: z.number().min(0).default(0),

  metaTitle: z
    .string()
    .trim()
    .max(160, "Maximum 160 characters allowed")
    .optional()
    .or(z.literal("")),

  metaDescription: z
    .string()
    .trim()
    .max(300, "Maximum 300 characters allowed")
    .optional()
    .or(z.literal("")),

  metaKeywords: z
    .string()
    .trim()
    .max(300, "Maximum 300 characters allowed")
    .optional()
    .or(z.literal("")),
};

const courseBaseSchema = z.object(courseFields);

export const createCourseSchema = courseBaseSchema;

export const updateCourseSchema = courseBaseSchema.partial();

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;
