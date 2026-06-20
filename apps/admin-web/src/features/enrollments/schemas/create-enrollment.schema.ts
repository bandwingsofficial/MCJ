import { z } from "zod";

export const createEnrollmentSchema =
  z.object({
    studentId: z
      .string()
      .min(
        1,
        "Student is required.",
      ),

    batchId: z
      .string()
      .min(
        1,
        "Batch is required.",
      ),

    feeAmount: z
      .number({
        error:
          "Fee amount is required.",
      })
      .min(
        0,
        "Fee amount cannot be negative.",
      ),

    discountAmount: z
      .number()
      .min(
        0,
        "Discount amount cannot be negative.",
      ),

    paidAmount: z
      .number()
      .min(
        0,
        "Paid amount cannot be negative.",
      ),

    remarks: z
      .string()
      .max(
        500,
        "Remarks cannot exceed 500 characters.",
      )
      .optional()
      .or(z.literal("")),
  });

export type CreateEnrollmentForm =
  z.infer<
    typeof createEnrollmentSchema
  >;