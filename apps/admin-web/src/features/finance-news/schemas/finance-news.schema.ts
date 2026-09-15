import { z } from "zod";

import {
  DEFAULT_AUTHOR_NAME,
  SHORT_DESCRIPTION_MAX_CHARS,
} from "@/src/features/finance-news/constants/finance-news.constants";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeFinanceNewsSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const optionalSlugSchema = z
  .string()
  .trim()
  .max(300, "Slug cannot exceed 300 characters")
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    const normalized = normalizeFinanceNewsSlug(value);

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

export const financeNewsFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(300, "Title cannot exceed 300 characters"),

  slug: optionalSlugSchema,

  shortDescription: z
    .string()
    .trim()
    .max(
      SHORT_DESCRIPTION_MAX_CHARS,
      `Short description cannot exceed ${SHORT_DESCRIPTION_MAX_CHARS} characters`,
    )
    .optional()
    .or(z.literal("")),

  content: z
    .string()
    .trim()
    .min(1, "Content is required"),

  categoryId: z
    .string()
    .trim()
    .min(1, "Category is required")
    .uuid("Select a valid category"),

  authorName: z
    .string()
    .trim()
    .max(120, "Author name cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),

  authorImage: z
    .string()
    .trim()
    .url("Author image must be a valid URL")
    .optional()
    .or(z.literal("")),

  tags: z.array(z.string().trim().min(1)),

  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type FinanceNewsFormValues = z.infer<typeof financeNewsFormSchema>;

export const defaultFinanceNewsFormValues: FinanceNewsFormValues = {
  title: "",
  slug: "",
  shortDescription: "",
  content: "",
  categoryId: "",
  authorName: DEFAULT_AUTHOR_NAME,
  authorImage: "",
  tags: [],
  status: "DRAFT",
};
