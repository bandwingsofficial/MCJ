import { z } from "zod";

export const courseFaqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
});

export type CourseFaqFormValues = z.infer<typeof courseFaqSchema>;
