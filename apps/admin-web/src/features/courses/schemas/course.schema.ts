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

  originalPrice: z
    .number({
      error: "Original price is required",
    })
    .min(0, "Original price cannot be negative"),

  discountPercent: z
    .number({
      error: "Discount percent is required",
    })
    .min(0, "Discount percent cannot be negative")
    .max(100, "Discount percent cannot exceed 100"),

  discountAmount: z
    .number({
      error: "Discount amount is required",
    })
    .min(0, "Discount amount cannot be negative"),

  currency: z.string().default("INR"),

  isFree: z.boolean().default(false),

  level: z.enum(COURSE_LEVELS).default("BEGINNER"),

  minimumQualifications: z
    .array(z.enum(COURSE_QUALIFICATIONS))
    .default([]),

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
        message: "Original price is required for paid courses",
      });
    }

    if (data.discountAmount > data.originalPrice) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountAmount"],
        message: "Discount amount cannot be greater than original price",
      });
    }

    if (
      data.isFree &&
      (data.originalPrice > 0 || data.discountAmount > 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isFree"],
        message: "Free courses cannot have pricing values",
      });
    }
  },
);

export const updateCourseSchema = courseBaseSchema.partial();

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export type UpdateCourseFormValues = z.infer<typeof updateCourseSchema>;
