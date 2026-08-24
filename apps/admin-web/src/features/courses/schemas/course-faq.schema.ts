import { z } from "zod";

import { countWords } from "@/src/shared/utils/word-count";

export const COURSE_FAQ_MIN_WORDS = 10;
export const COURSE_FAQ_MAX_WORDS = 100;

function wordLimitedFieldSchema(fieldLabel: "Question" | "Answer") {
  return z
    .string()
    .trim()
    .min(1, `${fieldLabel} is required`)
    .superRefine((value, ctx) => {
      const words = countWords(value);

      if (words < COURSE_FAQ_MIN_WORDS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be at least ${COURSE_FAQ_MIN_WORDS} words`,
        });
        return;
      }

      if (words > COURSE_FAQ_MAX_WORDS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} cannot exceed ${COURSE_FAQ_MAX_WORDS} words`,
        });
      }
    });
}

export const courseFaqSchema = z.object({
  question: wordLimitedFieldSchema("Question"),
  answer: wordLimitedFieldSchema("Answer"),
});

export type CourseFaqFormValues = z.infer<typeof courseFaqSchema>;
