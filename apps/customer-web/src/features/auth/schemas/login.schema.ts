// src/features/auth/schemas/login.schema.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(
      6,
      "Password must be at least 6 characters"
    ),
});

export type LoginFormValues =
  z.infer<typeof loginSchema>;