import { z } from "zod";

import { MIN_JOB_SALARY } from "@/src/features/jobs/constants/job.constants";

const optionalText = z.string().trim().optional().or(z.literal(""));

function isFutureDate(value: string) {
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return expiry > today;
}

const jobFormObject = z.object({
    title: z
      .string()
      .trim()
      .min(1, "Job title is required.")
      .min(3, "Job title must be at least 3 characters.")
      .max(200, "Job title must be less than 200 characters."),
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required.")
      .min(2, "Company name must be at least 2 characters.")
      .max(160),
    companyEmail: z
      .string()
      .trim()
      .min(1, "Company email is required.")
      .email("Enter a valid company email."),
    companyPhone: optionalText,
    companyWebsite: z
      .string()
      .trim()
      .url("Enter a valid website URL.")
      .optional()
      .or(z.literal("")),
    companyDescription: optionalText,
    companyLogo: optionalText,
    shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
    description: z
      .string()
      .trim()
      .min(1, "Description is required.")
      .min(20, "Description must be at least 20 characters."),
    responsibilities: optionalText,
    benefits: optionalText,
    location: z.string().trim().min(1, "Location is required.").min(2),
    city: optionalText,
    state: optionalText,
    country: z.string().trim().min(1, "Country is required."),
    category: z.string().trim().min(1, "Category is required."),
    department: optionalText,
    workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
    employmentType: z.enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
    ]),
    workingDays: z.enum([
      "ONE_DAY",
      "TWO_DAYS",
      "THREE_DAYS",
      "FOUR_DAYS",
      "FIVE_DAYS",
      "SIX_DAYS",
      "MONDAY_TO_FRIDAY",
      "MONDAY_TO_SATURDAY",
    ]),
    minExperience: z.number().min(0, "Experience cannot be negative."),
    maxExperience: z.number().min(0, "Experience cannot be negative."),
    minSalary: z
      .number({
        error: "Minimum salary is required.",
      })
      .min(MIN_JOB_SALARY, "Minimum salary must be at least ₹15,000."),
    maxSalary: z
      .number({
        error: "Maximum salary is required.",
      })
      .min(0, "Maximum salary cannot be negative."),
    salaryCurrency: z.string().trim().min(1),
    vacancies: z.number().min(1, "Number of openings must be at least 1."),
    applicationDeadline: z
      .string()
      .trim()
      .min(1, "Job expiry date is required."),
    skills: z
      .array(z.string().trim().min(1))
      .min(1, "Required skills are required."),
    preferredSkills: z.array(z.string().trim().min(1)),
    qualifications: z
      .array(z.string().trim().min(1))
      .min(1, "Minimum required qualification is required."),
    interviewNotes: optionalText,
  });

function applyJobFormRules(
  data: z.infer<typeof jobFormObject>,
  ctx: z.RefinementCtx,
  requireFutureDeadline: boolean,
) {
  if (data.maxExperience < data.minExperience) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxExperience"],
      message:
        "Maximum experience must be greater than or equal to minimum experience.",
    });
  }

  if (data.maxSalary < data.minSalary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxSalary"],
      message:
        "Maximum salary must be greater than or equal to minimum salary.",
    });
  }

  if (requireFutureDeadline && !isFutureDate(data.applicationDeadline)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["applicationDeadline"],
      message: "Job expiry date must be a future date.",
    });
  }
}

export const createJobSchema = jobFormObject.superRefine((data, ctx) =>
  applyJobFormRules(data, ctx, true),
);
export const updateJobSchema = jobFormObject.superRefine((data, ctx) =>
  applyJobFormRules(data, ctx, false),
);

const companyJobFormObject = jobFormObject.extend({
  companyPhone: z
    .string()
    .trim()
    .min(1, "Company phone is required.")
    .min(10, "Enter a valid phone number."),
});

export const companyOnboardingSchema = companyJobFormObject.superRefine(
  (data, ctx) => applyJobFormRules(data, ctx, true),
);

export type CreateJobFormValues = z.infer<typeof jobFormObject>;
