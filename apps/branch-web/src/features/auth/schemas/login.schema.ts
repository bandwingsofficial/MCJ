import { z } from "zod";

export const loginSchema =
  z.object({
    identifier: z
      .string()
      .trim()
      .min(
        1,
        "Email is required"
      ),

    password: z
      .string()
      .min(
        8,
        "Minimum 8 characters required"
      ),
  });

export type LoginFormValues =
  z.infer<typeof loginSchema>;