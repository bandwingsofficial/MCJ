// src/features/batches/schemas/batch.schema.ts

import { z } from "zod";

import {
  DESCRIPTION_WORD_LIMIT,
  countWords,
} from "@/src/features/batches/utils/batch-form.utils";
import { isEndDateBeforeStartDate } from "@/src/features/batches/utils/batch-schedule.utils";

const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

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

    categoryId: z.string().uuid("Please select a category"),

    startDate: z.string().min(1, "Start date is required"),

    endDate: z.string().min(1, "End date is required"),

    startTime: z
      .string()
      .min(1, "Start time is required")
      .regex(timePattern, "Enter a valid start time"),

    endTime: z
      .string()
      .min(1, "End time is required")
      .regex(timePattern, "Enter a valid end time"),

    daysOfWeek: z
      .array(dayOfWeekEnum)
      .min(1, "Select at least one batch day"),

    capacity: z.number().min(1, "Capacity must be greater than 0"),

    enrolledCount: z.number().min(0).default(0),

    mode: z.enum(["ONLINE", "OFFLINE", "RECORDED"]),

    isFeatured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.startDate &&
      data.endDate &&
      isEndDateBeforeStartDate(data.startDate, data.endDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be earlier than start date",
        path: ["endDate"],
      });
    }

    if (
      data.startTime &&
      data.endTime &&
      parseTimeToMinutes(data.endTime) <= parseTimeToMinutes(data.startTime)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
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
  });

export type BatchFormValues = z.infer<typeof batchSchema>;
