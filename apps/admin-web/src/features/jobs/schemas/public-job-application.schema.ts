import { z } from "zod";

const phonePattern = /^[6-9]\d{9}$/;
const optionalText = z.string().trim().optional().or(z.literal(""));

export const publicJobApplicationSchema = z.object({
  applicantName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .min(2, "Enter your full name."),
  applicantEmail: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  applicantPhone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^\+91/, ""))
    .refine((value) => phonePattern.test(value), {
      message: "Enter a valid 10-digit phone number.",
    }),
  currentLocation: z.string().trim().min(1, "Current location is required."),
  highestQualification: z
    .string()
    .trim()
    .min(1, "Highest qualification is required."),
  course: optionalText,
  yearsOfExperience: z
    .number({
      error: "Experience is required.",
    })
    .min(0, "Experience cannot be negative."),
  currentCompany: optionalText,
  skills: z.array(z.string().trim().min(1)).min(1, "Skills are required."),
  noticePeriod: optionalText,
  expectedSalary: z.number().min(0, "Expected salary cannot be negative.").optional(),
});

export type PublicJobApplicationFormValues = z.infer<
  typeof publicJobApplicationSchema
>;

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

export function buildApplicationRemarks(
  values: PublicJobApplicationFormValues,
): string | undefined {
  const lines: string[] = [];

  if (values.course?.trim()) {
    lines.push(`Course / Degree: ${values.course.trim()}`);
  }
  if (values.currentCompany?.trim()) {
    lines.push(`Current/Previous Company: ${values.currentCompany.trim()}`);
  }
  if (values.skills.length) {
    lines.push(`Skills: ${values.skills.join(", ")}`);
  }
  if (values.noticePeriod?.trim()) {
    lines.push(`Notice Period: ${values.noticePeriod.trim()}`);
  }

  return lines.length ? lines.join("\n") : undefined;
}
