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

export const companyJobOnboardingSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required.")
      .min(2, "Company name must be at least 2 characters."),
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
    title: z
      .string()
      .trim()
      .min(1, "Job title is required.")
      .min(3, "Job title must be at least 3 characters."),
    category: z.string().trim().min(1, "Category is required."),
    employmentType: z.enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
    ]),
    workingDays: z.enum([
      "MONDAY_TO_FRIDAY",
      "MONDAY_TO_SATURDAY",
      "FIVE_DAYS",
      "SIX_DAYS",
    ]),
    workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
    location: z.string().trim().min(1, "Location is required."),
    department: optionalText,
    minExperience: z.number().min(0, "Experience cannot be negative."),
    maxExperience: z.number().min(0, "Experience cannot be negative."),
    minSalary: z
      .number({ error: "Minimum salary is required." })
      .min(MIN_JOB_SALARY, "Minimum salary must be at least ₹15,000."),
    maxSalary: z
      .number({ error: "Maximum salary is required." })
      .min(0, "Maximum salary cannot be negative."),
    vacancies: z.number().min(1, "Number of openings must be at least 1."),
    applicationDeadline: z
      .string()
      .trim()
      .min(1, "Job expiry date is required.")
      .refine(isFutureDate, {
        message: "Job expiry date must be a future date.",
      }),
    skills: z
      .array(z.string().trim().min(1))
      .min(1, "Required skills are required."),
    preferredSkills: z.array(z.string().trim().min(1)),
    qualifications: z
      .array(z.string().trim().min(1))
      .min(1, "Minimum required qualification is required."),
    description: z
      .string()
      .trim()
      .min(1, "Description is required.")
      .min(20, "Description must be at least 20 characters."),
    responsibilities: optionalText,
    benefits: optionalText,
  })
  .superRefine((data, ctx) => {
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
  });

export type CompanyJobOnboardingValues = z.infer<
  typeof companyJobOnboardingSchema
>;

export interface CompanyJobSubmitResult {
  id: string;
  title: string;
  companyName: string;
  status: string;
  createdAt: string;
}
