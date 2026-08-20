// src/features/students/schemas/student.schema.ts

import { z } from "zod";

import { NOTES_MAX_LENGTH } from "@/src/features/students/utils/student-form.utils";

const currentYear = new Date().getFullYear();
const phoneRegex = /^\+?[0-9]{7,15}$/;

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || phoneRegex.test(value), {
    message: "Please enter a valid phone number",
  });

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Please enter a valid email address",
  });

export const studentSchema = z.object({
  studentCode: z.string().optional(),

  firstName: z
    .string()
    .trim()
    .min(2, "First name is required")
    .max(80, "First name cannot exceed 80 characters"),

  lastName: z
    .string()
    .trim()
    .max(80, "Last name cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),

  email: optionalEmail,

  phone: optionalPhone,

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),

  dateOfBirth: z.string().optional().or(z.literal("")),

  addressLine1: z.string().trim().max(160).optional().or(z.literal("")),
  addressLine2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),

  qualification: z.string().trim().max(200).optional().or(z.literal("")),
  collegeName: z.string().trim().max(200).optional().or(z.literal("")),
  specialization: z.string().trim().max(160).optional().or(z.literal("")),

  passingYear: z
    .number()
    .min(1900)
    .max(currentYear + 10)
    .optional(),

  parentName: z.string().trim().max(80).optional().or(z.literal("")),
  parentPhone: optionalPhone,
  emergencyContactName: z.string().trim().max(80).optional().or(z.literal("")),
  emergencyContactPhone: optionalPhone,

  admissionDate: z.string().optional().or(z.literal("")),

  branchId: z.string().uuid("Please select a branch"),

  notes: z
    .string()
    .max(
      NOTES_MAX_LENGTH,
      `Notes cannot exceed ${NOTES_MAX_LENGTH} characters`,
    )
    .optional()
    .or(z.literal("")),

  status: z.enum([
    "LEAD",
    "ENQUIRED",
    "ADMITTED",
    "COMPLETED",
    "DROPPED",
    "PLACED",
  ]),

  profileImageFileId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),
});

export type StudentFormSchema = z.infer<typeof studentSchema>;
export type StudentFormValues = StudentFormSchema;
