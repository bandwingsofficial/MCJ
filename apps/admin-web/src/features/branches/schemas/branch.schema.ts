import { z } from "zod";

export const createBranchSchema = z.object({
  branchName: z
    .string()
    .trim()
    .min(3, "Branch name is required"),

  branchCode: z
    .string()
    .trim()
    .regex(
      /^(MCJB\d{3}|[A-Za-z0-9_-]{2,20})$/,
      "Invalid branch code format",
    ),

  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email address."),

  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .min(10, "Invalid phone number."),

  addressLine1: z
    .string()
    .trim()
    .min(2, "Address Line 1 is required."),

  addressLine2: z.string().optional(),

  city: z.string().trim().min(2, "City is required."),

  state: z.string().trim().min(2, "State is required."),

  country: z
    .string()
    .trim()
    .min(2, "Country is required."),

  postalCode: z
    .string()
    .trim()
    .min(3, "Postal Code is required."),

  latitude: z.coerce.number({
    message: "Latitude is required.",
  }),

  longitude: z.coerce.number({
    message: "Longitude is required.",
  }),

  description: z.string().optional(),
});

export const updateBranchSchema =
  createBranchSchema.partial();

export type CreateBranchFormValues = z.infer<
  typeof createBranchSchema
>;

export type UpdateBranchFormValues = z.infer<
  typeof updateBranchSchema
>;
