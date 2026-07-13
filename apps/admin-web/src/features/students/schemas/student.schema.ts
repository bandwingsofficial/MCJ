// src/features/students/schemas/student.schema.ts

import { z } from "zod";

const currentYear = new Date().getFullYear();

export const studentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required")
    .max(100),
    
    profileImageFileId: z
  .string()
  .uuid()
  .optional()
  .or(z.literal("")),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name is required")
    .max(100),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  phone: z
    .string()
    .trim()
    .min(10)
    .max(15),

  gender: z.enum([
    "MALE",
    "FEMALE",
    "OTHER",
  ]),

  dateOfBirth: z.string().min(1),

  addressLine1: z.string().optional(),

  addressLine2: z.string().optional(),

  city: z.string().optional(),

  state: z.string().optional(),

  country: z.string().optional(),

  postalCode: z.string().optional(),

  qualification: z.string().optional(),

  collegeName: z.string().optional(),

  specialization: z.string().optional(),

  passingYear: z
    .number()
    .min(1900)
    .max(currentYear + 10)
    .optional(),

  parentName: z.string().optional(),

  parentPhone: z.string().optional(),

  emergencyContactName: z.string().optional(),

  emergencyContactPhone: z.string().optional(),

  admissionDate: z.string().min(1),

  branchId: z
    .string()
    .uuid("Invalid branch"),

  notes: z.string().optional(),

  status: z.enum([
    "LEAD",
    "ENQUIRED",
    "ADMITTED",
    "ACTIVE",
    "INACTIVE",
    "COMPLETED",
    "DROPPED",
    "PLACED",
  ]),
});

export type StudentFormSchema =
  z.infer<typeof studentSchema>;