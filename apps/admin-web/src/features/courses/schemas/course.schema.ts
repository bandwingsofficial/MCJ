// src/features/courses/schemas/course.schema.ts

import { z } from "zod";

import {
  COURSE_DURATION_TYPES,
  COURSE_LEVELS,
  COURSE_MODES,
} from "@/src/features/courses/constants/course.constants";

const courseFields = {
  title: z
    .string()
    .trim()
    .min(
      3,
      "Title is required"
    )
    .max(
      150,
      "Maximum 150 characters allowed"
    ),
    thumbnailFileId:
z.string().optional(),

  tagline: z
    .string()
    .trim()
    .max(
      255,
      "Maximum 255 characters allowed"
    )
    .optional(),

  shortDescription: z
    .string()
    .trim()
    .max(
      500,
      "Maximum 500 characters allowed"
    )
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  categoryId: z
    .string()
    .uuid(
      "Invalid category selected"
    ),

  branchIds: z
    .array(
      z.string().uuid(
        "Invalid branch selected"
      )
    )
    .optional(),

  originalPrice: z
    .number({
      error:
        "Original price is required",
    })
    .min(
      0,
      "Original price cannot be negative"
    ),

  discountPrice: z
    .number({
      error:
        "Discount price is required",
    })
    .min(
      0,
      "Discount price cannot be negative"
    ),

  currency: z
    .string()
    .default("INR"),

  isFree: z.boolean(),

  duration: z
    .number()
    .optional(),

  durationType: z
    .enum(
      COURSE_DURATION_TYPES
    )
    .optional(),

  level: z.enum(
    COURSE_LEVELS
  ),

  modes: z
    .array(
      z.enum(
        COURSE_MODES
      )
    )
    .min(
      1,
      "At least one mode is required"
    ),

  language: z
    .string()
    .trim()
    .min(
      2,
      "Language is required"
    ),

  displayOrder: z
    .number()
    .min(0),

  metaTitle: z
    .string()
    .trim()
    .max(255)
    .optional(),

  metaDescription: z
    .string()
    .trim()
    .max(500)
    .optional(),

  metaKeywords: z
    .string()
    .trim()
    .max(500)
    .optional(),
};

const courseBaseSchema =
  z.object(courseFields);

export const createCourseSchema =
  courseBaseSchema.superRefine(
    (data, context) => {
      if (
        data.discountPrice >
        data.originalPrice
      ) {
        context.addIssue({
          code:
            z.ZodIssueCode.custom,
          path: [
            "discountPrice",
          ],
          message:
            "Discount price cannot be greater than original price",
        });
      }

      if (
        data.isFree &&
        (
          data.originalPrice >
            0 ||
          data.discountPrice >
            0
        )
      ) {
        context.addIssue({
          code:
            z.ZodIssueCode.custom,
          path: [
            "isFree",
          ],
          message:
            "Free courses cannot have original price or discount price",
        });
      }
    }
  );

export const updateCourseSchema =
  courseBaseSchema.partial();

export type CreateCourseFormValues =
  z.infer<
    typeof createCourseSchema
  >;

export type UpdateCourseFormValues =
  z.infer<
    typeof updateCourseSchema
  >;