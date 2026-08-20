import { z } from "zod";

import {
  optionalMoneyField,
  requiredMoneyField,
} from "@/src/features/enrollments/schemas/money.schema";

export const createEnrollmentSchema = z
  .object({
    studentId: z.string().min(1, "Student is required."),
    batchId: z.string().min(1, "Batch is required."),
    feeAmount: requiredMoneyField("Fee amount is required."),
    discountAmount: optionalMoneyField.default(0),
  })
  .superRefine((values, context) => {
    if (values.discountAmount > values.feeAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount amount cannot exceed fee amount.",
        path: ["discountAmount"],
      });
    }
  });

export type CreateEnrollmentForm = z.infer<typeof createEnrollmentSchema>;
