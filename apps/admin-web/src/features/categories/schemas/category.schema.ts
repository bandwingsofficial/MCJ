import { z } from "zod";

import { countWords } from "@/src/shared/utils/word-count";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CATEGORY_DESCRIPTION_MIN_WORDS = 10;
export const CATEGORY_DESCRIPTION_MAX_WORDS = 100;

/** Matches backend `Slug.normalize()` / `@common/value-objects/slug.vo`. */
export function normalizeCategorySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const optionalSlugSchema = z
  .string()
  .trim()
  .max(140, "Slug cannot exceed 140 characters")
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    const normalized = normalizeCategorySlug(value);

    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Slug must contain letters or numbers",
      });
      return;
    }

    if (!slugPattern.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Slug must use lowercase letters, numbers, and single hyphens only",
      });
    }
  })
  .optional()
  .or(z.literal(""));

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .superRefine((value, ctx) => {
    const words = countWords(value);

    if (words < CATEGORY_DESCRIPTION_MIN_WORDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Description must be at least ${CATEGORY_DESCRIPTION_MIN_WORDS} words`,
      });
      return;
    }

    if (words > CATEGORY_DESCRIPTION_MAX_WORDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX_WORDS} words`,
      });
    }
  });

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(120, "Category name cannot exceed 120 characters"),

  slug: optionalSlugSchema,

  description: descriptionSchema,

  displayOrder: z
    .number({
      message: "Display order must be a whole number",
    })
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/** @deprecated Use categoryFormSchema */
export const createCategorySchema = categoryFormSchema;

/** @deprecated Use CategoryFormValues */
export type CreateCategoryFormValues = CategoryFormValues;

export const updateCategorySchema = categoryFormSchema;

export type UpdateCategoryFormValues = CategoryFormValues;
