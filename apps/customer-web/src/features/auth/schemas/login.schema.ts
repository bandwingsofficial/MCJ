// src/features/auth/schemas/login.schema.ts

import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(
      1,
      "Email or phone number is required"
    ),

  password: z
    .string()
    .min(
      6,
      "Password must be at least 6 characters"
    ),
}).transform((data) => {
  // If the identifier looks like an email, force it to lowercase to prevent backend mismatches
  if (data.identifier.includes("@")) {
    return {
      ...data,
      identifier: data.identifier.toLowerCase(),
    };
  }
  return data;
});

export type LoginFormValues =
  z.infer<typeof loginSchema>;