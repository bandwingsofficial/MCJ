import { z } from "zod";

export const courseFaqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(500, "Question must be 500 characters or less"),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required")
    .max(5000, "Answer must be 5000 characters or less"),
});

export type CourseFaqFormValues = z.infer<typeof courseFaqSchema>;
