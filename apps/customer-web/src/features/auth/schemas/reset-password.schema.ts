// src/features/auth/schemas/reset-password.schema.ts

import { z } from "zod";

export const resetPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        "Please enter a valid email"
      ),

    otp: z
      .string()
      .trim()
      .length(
        6,
        "OTP must contain 6 digits"
      ),

    newPassword: z
      .string()
      .min(
        6,
        "Password must be at least 6 characters"
      ),
  });

export type ResetPasswordFormValues =
  z.infer<
    typeof resetPasswordSchema
  >;