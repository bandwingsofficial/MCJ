import { z } from "zod";

import { ENROLLMENT_MAX_REMARKS_LENGTH } from "@/src/features/enrollments/constants/enrollment.constants";

export const enrollmentSchema = z.object({
  batchId: z
    .string()
    .min(1, "Please select a batch."),

  remarks: z
    .string()
    .trim()
    .max(
      ENROLLMENT_MAX_REMARKS_LENGTH,
      `Remarks cannot exceed ${ENROLLMENT_MAX_REMARKS_LENGTH} characters.`,
    )
    .optional(),
});

export type EnrollmentFormValues =
  z.infer<
    typeof enrollmentSchema
  >;