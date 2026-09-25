// src/features/auth/schemas/register.schema.ts

import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Name is required"
    )
    .max(
      100,
      "Maximum 100 characters allowed"
    ),

  email: z
    .string()
    .trim()
    .email(
      "Please enter a valid email"
    ),

  phone: z
    .string()
    .trim()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must contain 10 digits"
    ),

  password: z
    .string()
    .min(
      6,
      "Password must be at least 6 characters"
    ),

  referralCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6,12}$/, "Invalid referral code")
    .optional()
    .or(z.literal("")),
});

export type RegisterFormValues =
  z.infer<typeof registerSchema>;