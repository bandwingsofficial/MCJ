import { z } from "zod";

import {
  COURSE_DURATION_TYPES,
  COURSE_LEVELS,
  COURSE_MODES,
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

  originalPrice: z
    .number({
      error: "Course fee is required",
    })
    .min(0, "Course fee cannot be negative"),

  discountPrice: z
    .number({
      error: "Discount price is required",
    })
    .min(0, "Discount price cannot be negative"),

  currency: z.string().default("INR"),

  isFree: z.boolean().default(false),

  duration: z
    .number({
      error: "Duration is required",
    })
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1"),

  durationType: z.enum(COURSE_DURATION_TYPES, {
    error: "Please select a duration type",
  }),

  level: z.enum(COURSE_LEVELS).default("BEGINNER"),

  modes: z
    .array(z.enum(COURSE_MODES))
    .min(1, "Please select a type"),

  language: z
    .string()
    .trim()
    .min(2, "Language is required"),

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

export const createCourseSchema = courseBaseSchema.superRefine(
  (data, context) => {
    if (
      !data.isFree &&
      (data.originalPrice == null || data.originalPrice <= 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["originalPrice"],
        message: "Course fee is required for paid courses",
      });
    }

    if (data.discountPrice > data.originalPrice) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPrice"],
        message: "Discount price cannot be greater than original price",
      });
    }

    if (
      data.isFree &&
      (data.originalPrice > 0 || data.discountPrice > 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isFree"],
        message: "Free courses cannot have original price or discount price",
      });
    }
  },
);

export const updateCourseSchema = courseBaseSchema.partial();

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;
