import { z } from "zod";

export const updateEnrollmentSchema =
  z.object({
    feeAmount: z
      .number()
      .min(0),

    discountAmount: z
      .number()
      .min(0),

    paidAmount: z
      .number()
      .min(0),

    remarks: z
      .string()
      .max(500)
      .optional()
      .or(z.literal("")),

    isActive:
      z.boolean(),
  });

export type UpdateEnrollmentForm =
  z.infer<
    typeof updateEnrollmentSchema
  >;