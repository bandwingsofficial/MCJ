import { z } from "zod";

import {
  optionalMoneyField,
  requiredMoneyField,
} from "@/src/features/enrollments/schemas/money.schema";

export const studentEnrollmentFormSchema = z
  .object({
    batchId: z.string().min(1, "Batch is required"),
    feeAmount: requiredMoneyField("Fee amount is required"),
    discountAmount: optionalMoneyField.default(0),
  })
  .superRefine((values, context) => {
    if (values.discountAmount > values.feeAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount amount cannot exceed fee amount",
        path: ["discountAmount"],
      });
    }
  });

export type StudentEnrollmentFormValues = z.infer<
  typeof studentEnrollmentFormSchema
>;

export const DEFAULT_STUDENT_ENROLLMENT_FORM_VALUES: StudentEnrollmentFormValues =
  {
    batchId: "",
    feeAmount: 0,
    discountAmount: 0,
  };
