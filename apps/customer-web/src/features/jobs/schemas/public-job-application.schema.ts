import { z } from "zod";

const phonePattern = /^[6-9]\d{9}$/;

export const publicJobApplicationSchema = z.object({
  applicantName: z
    .string()
    .trim()
    .min(1, "This field is required.")
    .min(2, "Enter your full name."),
  applicantEmail: z
    .string()
    .trim()
    .min(1, "This field is required.")
    .email("Please enter a valid email address."),
  applicantPhone: z
    .string()
    .trim()
    .min(1, "This field is required.")
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^\+91/, ""))
    .refine((value) => phonePattern.test(value), {
      message: "Please enter a valid phone number.",
    }),
  currentLocation: z.string().trim().min(1, "This field is required."),
  highestQualification: z.string().trim().min(1, "This field is required."),
  yearsOfExperience: z
    .number({
      error: "This field is required.",
    })
    .min(0, "Experience cannot be negative."),
  coverLetter: z.string().trim().optional().or(z.literal("")),
});

export type PublicJobApplicationFormValues = z.infer<
  typeof publicJobApplicationSchema
>;

export interface PublicJobApplicationResult {
  id: string;
  applicationNumber: string;
  createdAt: string;
  job?: {
    title: string;
    jobNumber?: string;
  };
}

const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function validateResumeFile(file: File | null): string | null {
  if (!file) {
    return "Please upload your resume.";
  }

  const name = file.name.toLowerCase();
  const hasValidExtension =
    name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");

  if (!RESUME_MIME_TYPES.has(file.type) && !hasValidExtension) {
    return "Resume must be a PDF, DOC, or DOCX file.";
  }

  if (file.size > 10 * 1024 * 1024) {
    return "Resume must be 10MB or smaller.";
  }

  return null;
}
