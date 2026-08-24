// src/features/batches/schemas/batch.schema.ts

import { z } from "zod";

import { DESCRIPTION_WORD_LIMIT, countWords } from "@/src/features/batches/utils/batch-form.utils";

const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const batchSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Batch name must be at least 3 characters")
      .max(100, "Batch name cannot exceed 100 characters"),

    code: z
      .string()
      .trim()
      .min(2, "Batch code is required")
      .max(30, "Batch code cannot exceed 30 characters"),

    description: z.string().optional().or(z.literal("")),

    courseId: z.string().uuid("Please select a course"),

    branchId: z
      .string()
      .uuid("Please select a valid branch")
      .optional()
      .or(z.literal("")),

    startDate: z.string().min(1, "Start date is required"),

    endDate: z.string().min(1, "End date is required"),

    daysOfWeek: z
      .array(dayOfWeekEnum)
      .min(1, "Select at least one batch day"),

    capacity: z.number().min(1, "Capacity must be greater than 0"),

    enrolledCount: z.number().min(0).default(0),

    mode: z.enum(["ONLINE", "OFFLINE", "RECORDED"]),

    status: z.enum([
      "UPCOMING",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
      "ARCHIVED",
    ]),

    classroom: z.string().optional(),

    meetingLink: z
      .string()
      .url("Invalid meeting link")
      .optional()
      .or(z.literal("")),

    isFeatured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date",
        path: ["endDate"],
      });
    }

    const wordCount = countWords(data.description ?? "");
    if (wordCount > DESCRIPTION_WORD_LIMIT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Description cannot exceed ${DESCRIPTION_WORD_LIMIT} words`,
        path: ["description"],
      });
    }

    if (data.mode === "ONLINE" && !data.meetingLink?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meeting link is required for online batches",
        path: ["meetingLink"],
      });
    }

    if (data.mode === "OFFLINE" && !data.classroom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Classroom is required for offline batches",
        path: ["classroom"],
      });
    }
  });

export type BatchFormValues = z.infer<typeof batchSchema>;
