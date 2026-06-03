import { z } from "zod";

export const createBranchSchema =
  z.object({
    branchName: z
      .string()
      .trim()
      .min(3, "Branch name is required"),

    branchCode: z
      .string()
      .trim()
      .min(2, "Branch code is required"),

    email: z
      .string()
      .email("Invalid email"),

    phone: z
      .string()
      .min(10, "Invalid phone"),

    addressLine1: z
      .string()
      .min(2),

    addressLine2:
      z.string().optional(),

    city: z.string().min(2),

    state: z.string().min(2),

    country: z.string().min(2),

    postalCode: z.string().min(3),

    latitude:
      z.coerce.number(),

    longitude:
      z.coerce.number(),

    description:
      z.string().optional(),
  });

export const updateBranchSchema =
  createBranchSchema.partial();

export type CreateBranchFormValues =
  z.infer<
    typeof createBranchSchema
  >;

export type UpdateBranchFormValues =
  z.infer<
    typeof updateBranchSchema
  >;