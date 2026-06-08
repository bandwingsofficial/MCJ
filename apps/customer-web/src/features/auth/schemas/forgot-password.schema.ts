// src/features/auth/schemas/forgot-password.schema.ts

import { z } from "zod";

export const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        "Please enter a valid email"
      ),
  });

export type ForgotPasswordFormValues =
  z.infer<
    typeof forgotPasswordSchema
  >;