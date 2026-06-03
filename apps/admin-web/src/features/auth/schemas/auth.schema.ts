import { z } from "zod";

export const loginSchema =
  z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email"),

    password: z
      .string()
      .min(
        1,
        "Password is required"
      ),
  });

export type LoginFormValues =
  z.infer<typeof loginSchema>;

export const totpSchema =
  z.object({
    totpCode: z
      .string()
      .length(
        6,
        "Enter valid 6 digit code"
      ),
  });

export type TotpFormValues =
  z.infer<typeof totpSchema>;