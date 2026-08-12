import { z } from "zod";

export const createCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        "Category name is required"
      )
      .max(
        100,
        "Category name cannot exceed 100 characters"
      ),

    thumbnailFileId:
      z.string().nullable().optional(),

    description: z
      .string()
      .max(
        500,
        "Description cannot exceed 500 characters"
      )
      .optional(),

    branchId: z.string().optional(),

    status: z.enum([
      "ACTIVE",
      "INACTIVE",
    ]),
  });

export type CreateCategoryFormValues =
  z.infer<
    typeof createCategorySchema
  >;

export const updateCategorySchema =
  createCategorySchema.partial();

export type UpdateCategoryFormValues =
  z.infer<
    typeof updateCategorySchema
  >;
