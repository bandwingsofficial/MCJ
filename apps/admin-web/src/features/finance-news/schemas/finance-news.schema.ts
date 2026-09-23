import { z } from "zod";

import {
  DEFAULT_AUTHOR_NAME,
  SHORT_DESCRIPTION_MAX_CHARS,
} from "@/src/features/finance-news/constants/finance-news.constants";

export const financeNewsFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(300, "Title cannot exceed 300 characters"),

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

  tags: z.array(z.string().trim().min(1)),

  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),

  metaTitle: z
    .string()
    .trim()
    .max(160, "Meta title cannot exceed 160 characters")
    .optional()
    .or(z.literal("")),

  metaDescription: z
    .string()
    .trim()
    .max(300, "Meta description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),

  metaKeywords: z
    .string()
    .trim()
    .max(500, "Meta keywords cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type FinanceNewsFormValues = z.infer<typeof financeNewsFormSchema>;

export const defaultFinanceNewsFormValues: FinanceNewsFormValues = {
  title: "",
  shortDescription: "",
  content: "",
  categoryId: "",
  authorName: DEFAULT_AUTHOR_NAME,
  tags: [],
  status: "DRAFT",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};
