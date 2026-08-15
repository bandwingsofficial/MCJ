import { z } from "zod";

const quizQuestionOptionSchema = z.object({
  optionText: z
    .string()
    .trim()
    .min(1, "Option text is required.")
    .max(500, "Option text cannot exceed 500 characters."),
  isCorrect: z.boolean(),
});

export const courseQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quiz title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters."),
  passingScore: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Passing score must be a whole number.",
    )
    .refine(
      (value) => value === "" || Number(value) >= 0 && Number(value) <= 100,
      "Passing score must be between 0 and 100.",
    ),
  timeLimitMinutes: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Time limit must be a whole number.",
    )
    .refine(
      (value) => value === "" || Number(value) >= 1,
      "Time limit must be at least 1 minute.",
    ),
});

export const quizQuestionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1, "Question text is required.")
      .max(2000, "Question text cannot exceed 2000 characters."),
    type: z.enum([
      "MULTIPLE_CHOICE",
      "TRUE_FALSE",
      "MULTIPLE_SELECT",
    ]),
    explanation: z
      .string()
      .trim()
      .max(2000, "Explanation cannot exceed 2000 characters."),
    points: z
      .string()
      .trim()
      .min(1, "Points are required.")
      .refine((value) => /^\d+$/.test(value), "Points must be a whole number.")
      .refine((value) => Number(value) >= 1, "Points must be at least 1."),
    options: z
      .array(quizQuestionOptionSchema)
      .min(1, "At least one option is required."),
  })
  .superRefine((values, ctx) => {
    const correctCount = values.options.filter((option) => option.isCorrect)
      .length;

    if (values.type === "MULTIPLE_CHOICE" || values.type === "TRUE_FALSE") {
      if (values.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "At least two options are required.",
          path: ["options"],
        });
      }

      if (correctCount !== 1) {
        ctx.addIssue({
          code: "custom",
          message: "Exactly one correct answer is required.",
          path: ["options"],
        });
      }
    }

    if (values.type === "MULTIPLE_SELECT") {
      if (values.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "At least two options are required.",
          path: ["options"],
        });
      }

      if (correctCount < 1) {
        ctx.addIssue({
          code: "custom",
          message: "At least one correct answer is required.",
          path: ["options"],
        });
      }
    }
  });

export type CourseQuizSchema = z.infer<typeof courseQuizSchema>;
export type QuizQuestionSchema = z.infer<typeof quizQuestionSchema>;
