import { z } from "zod";

export const applyJobSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(
      20,
      "Cover letter must be at least 20 characters.",
    )
    .max(
      5000,
      "Cover letter cannot exceed 5000 characters.",
    ),

  currentLocation: z
    .string()
    .trim()
    .min(
      2,
      "Current location is required.",
    )
    .max(
      100,
      "Current location cannot exceed 100 characters.",
    ),

  expectedSalary: z
    .number({
      error: "Expected salary is required.",
    })
    .int(
      "Expected salary must be a whole number.",
    )
    .positive(
      "Expected salary must be greater than zero.",
    )
    .max(
      100000000,
      "Expected salary is too large.",
    ),

 remarks: z
  .string()
  .trim()
  .max(
    1000,
    "Remarks cannot exceed 1000 characters.",
  ),
});

export type ApplyJobSchema = z.infer<
  typeof applyJobSchema
>;