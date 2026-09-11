import { z } from "zod";

const currentYear = new Date().getFullYear();

const phoneRegex = /^\+?[1-9]\d{9,14}$/;

const postalCodeRegex = /^[0-9]{6}$/;

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || phoneRegex.test(value),
    "Please enter a valid phone number.",
  );

export const createStudentProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(100, "First name cannot exceed 100 characters."),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(100, "Last name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),

  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please enter a valid phone number."),

  gender: z.enum([
    "MALE",
    "FEMALE",
    "OTHER",
  ]),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required."),

  addressLine1: z
    .string()
    .trim()
    .min(3, "Address is required.")
    .max(255),

  addressLine2: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(100),

  state: z
    .string()
    .trim()
    .min(2, "State is required.")
    .max(100),

  country: z
    .string()
    .trim()
    .min(2, "Country is required.")
    .max(100),

  postalCode: z
    .string()
    .trim()
    .regex(
      postalCodeRegex,
      "Postal code must contain exactly 6 digits.",
    ),

  qualification: z
    .string()
    .trim()
    .min(2, "Qualification is required.")
    .max(150),

  collegeName: z
    .string()
    .trim()
    .min(2, "College name is required.")
    .max(255),

  specialization: z
    .string()
    .trim()
    .min(2, "Specialization is required.")
    .max(255),

  passingYear: z
    .number()
    .min(1980, "Passing year is invalid.")
    .max(currentYear + 10, "Passing year is invalid."),

  parentName: z
    .string()
    .trim()
    .min(2, "Parent name is required.")
    .max(150),

  parentPhone: z
    .string()
    .trim()
    .regex(
      phoneRegex,
      "Please enter a valid parent phone number.",
    ),

  emergencyContactName: z
    .string()
    .trim()
    .min(
      2,
      "Emergency contact name is required.",
    )
    .max(150),

  emergencyContactPhone: z
    .string()
    .trim()
    .regex(
      phoneRegex,
      "Please enter a valid emergency contact number.",
    ),

  notes: z
    .string()
    .trim()
    .max(
      1000,
      "Notes cannot exceed 1000 characters.",
    )
    .optional()
    .or(z.literal("")),
});

export const optionalCreateStudentProfileSchema = z.object({
  firstName: optionalTrimmedString(100),
  lastName: optionalTrimmedString(100),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),
  phone: optionalPhone,
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: optionalTrimmedString(32),
  addressLine1: optionalTrimmedString(255),
  addressLine2: optionalTrimmedString(255),
  city: optionalTrimmedString(100),
  state: optionalTrimmedString(100),
  country: optionalTrimmedString(100),
  postalCode: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || postalCodeRegex.test(value),
      "Postal code must contain exactly 6 digits.",
    ),
  qualification: optionalTrimmedString(150),
  collegeName: optionalTrimmedString(255),
  specialization: optionalTrimmedString(255),
  passingYear: z
    .union([
      z.literal(""),
      z.coerce.number().min(1980).max(currentYear + 10),
    ])
    .optional(),
  emergencyContactName: optionalTrimmedString(150),
  emergencyContactPhone: optionalPhone,
});

export const updateStudentProfileSchema =
  createStudentProfileSchema.pick({
    qualification: true,
    collegeName: true,
    specialization: true,
    passingYear: true,
    parentName: true,
    parentPhone: true,
    emergencyContactName: true,
    emergencyContactPhone: true,
    notes: true,
  });

export type CreateStudentProfileFormValues =
  z.infer<
    typeof createStudentProfileSchema
  >;

export type OptionalCreateStudentProfileFormValues =
  z.infer<
    typeof optionalCreateStudentProfileSchema
  >;

export type UpdateStudentProfileFormValues =
  z.infer<
    typeof updateStudentProfileSchema
  >;
