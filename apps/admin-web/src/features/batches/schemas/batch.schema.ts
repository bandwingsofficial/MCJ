// src/features/batches/schemas/batch.schema.ts

import { z } from "zod";

export const batchSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Batch name is required")
      .max(100, "Batch name cannot exceed 100 characters"),

    code: z
      .string()
      .trim()
      .min(2, "Batch code is required")
      .max(30, "Batch code cannot exceed 30 characters"),

    description: z
      .string()
      .max(1000)
      .optional()
      .or(z.literal("")),

    courseId: z
      .string()
      .uuid("Please select a valid course"),

    branchId: z
      .string()
      .uuid("Please select a valid branch")
      .optional()
      .or(z.literal("")),

    startDate: z
      .string()
      .min(1, "Start date is required"),

    endDate: z.string().optional(),

    startTime: z
      .string()
      .min(1, "Start time is required"),

    endTime: z
      .string()
      .min(1, "End time is required"),

    daysOfWeek: z
      .array(
        z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
      )
      .min(1, "Select at least one day"),

   capacity: z
  .number()
  .min(1, "Capacity must be greater than 0"),

    enrolledCount: z
      .number()
      .min(0)
      .default(0),

    mode: z.enum([
      "ONLINE",
      "OFFLINE",
      "HYBRID",
    ]),

    classroom: z.string().optional(),

    meetingLink: z
      .string()
      .url("Invalid meeting link")
      .optional()
      .or(z.literal("")),

    isFeatured: z.boolean(),

    trainerIds: z
      .array(z.string().uuid())
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.endDate &&
      new Date(data.endDate) <
        new Date(data.startDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "End date cannot be before start date",
        path: ["endDate"],
      });
    }

    if (
      data.mode === "ONLINE" &&
      !data.meetingLink
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Meeting link is required",
        path: ["meetingLink"],
      });
    }

    if (
      data.mode === "OFFLINE" &&
      !data.classroom
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Classroom is required",
        path: ["classroom"],
      });
    }
  });

export type BatchFormValues =
  z.infer<typeof batchSchema>;