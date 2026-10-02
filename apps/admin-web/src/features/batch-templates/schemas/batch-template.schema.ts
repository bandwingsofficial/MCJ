import { z } from "zod";

export const batchTemplateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Batch Name is required.")
      .max(160, "Batch name cannot exceed 160 characters"),
    mode: z.enum(["ONLINE", "OFFLINE", "RECORDED"], {
      error: "Mode is required.",
    }),
    hasFixedTime: z.boolean(),
    daysOfWeek: z.array(
      z.enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ]),
    ),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isActive: z.boolean(),
    capacity: z
      .number({ message: "Capacity is required" })
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1"),
  })
  .superRefine((values, ctx) => {
    if (!values.hasFixedTime) {
      return;
    }

    if (!values.daysOfWeek.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysOfWeek"],
        message: "Batch Days is required.",
      });
    }

    if (!values.startTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start Time is required.",
      });
    }

    if (!values.endTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End Time is required.",
      });
    }
  });

export type BatchTemplateFormValues = z.infer<typeof batchTemplateSchema>;
