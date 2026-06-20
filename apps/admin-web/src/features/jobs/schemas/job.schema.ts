import { z } from "zod";

const interviewProcessSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Interview title is required")
    .max(100),

  description: z
    .string()
    .trim()
    .min(1, "Interview description is required")
    .max(500),
});

const baseJobSchema = z.object({
    title: z
      .string()
      .trim()
      .min(3)
      .max(200),

    companyName: z
      .string()
      .trim()
      .min(2)
      .max(150),

    companyLogo: z
      .string()
      .url()
      .optional()
      .or(z.literal("")),

    companyWebsite: z
      .string()
      .url()
      .optional()
      .or(z.literal("")),

    companyDescription: z
      .string()
      .max(2000)
      .optional(),

    shortDescription: z
      .string()
      .max(300)
      .optional(),

    description: z
      .string()
      .trim()
      .min(20),

    location: z
      .string()
      .trim()
      .min(2),

    city: z
      .string()
      .trim()
      .min(2),

    state: z
      .string()
      .trim()
      .min(2),

    country: z
      .string()
      .trim()
      .min(2),

    isRemote: z.boolean(),

  employmentType: z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]),

workingDays: z.enum([
  "MONDAY_TO_FRIDAY",
  "MONDAY_TO_SATURDAY",
  "FLEXIBLE",
]),

status: z
  .enum([
    "DRAFT",
    "ACTIVE",
    "CLOSED",
    "EXPIRED",
  ])
  .optional(),

    minExperience: z
      .number()
      .min(0),

    maxExperience: z
      .number()
      .min(0),

    minSalary: z
      .number()
      .min(0),

    maxSalary: z
      .number()
      .min(0),

    salaryCurrency: z
      .string()
      .trim()
      .min(1),

    vacancies: z
      .number()
      .min(1),

    applicationDeadline: z
      .string()
      .min(1),

    responsibilities: z
  .string()
  .min(
    1,
    "Responsibilities are required",
  ),

skills: z
  .string()
  .min(
    1,
    "Skills are required",
  ),

    eligibilityTitle: z
      .string()
      .trim()
      .min(2),

    interviewProcess: z
      .array(interviewProcessSchema)
      .min(1),
  })
  export const createJobSchema =
  baseJobSchema.superRefine((data, ctx) => {
    if (
      data.maxExperience <
      data.minExperience
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxExperience"],
        message:
          "Maximum experience must be greater than minimum experience",
      });
    }

    if (
      data.maxSalary <
      data.minSalary
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxSalary"],
        message:
          "Maximum salary must be greater than minimum salary",
      });
    }
  });
  
export const updateJobSchema =
  baseJobSchema.partial();

export type CreateJobFormValues =
  z.infer<
    typeof createJobSchema
  >;

export type UpdateJobFormValues =
  z.infer<
    typeof updateJobSchema
  >;