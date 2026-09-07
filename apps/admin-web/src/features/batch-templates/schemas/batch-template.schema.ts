import { z } from "zod";

export const batchTemplateSchema = z
  .object({
    name: z.string().trim().min(1, "Template name is required").max(160),
    mode: z.enum(["ONLINE", "OFFLINE", "RECORDED"]),
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
      .number({ invalid_type_error: "Capacity is required" })
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
        message: "Select at least one day",
      });
    }

    if (!values.startTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time is required",
      });
    }

    if (!values.endTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time is required",
      });
    }
  });

export type BatchTemplateFormValues = z.infer<typeof batchTemplateSchema>;
