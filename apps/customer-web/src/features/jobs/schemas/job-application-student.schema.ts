import { z } from "zod";

import { createStudentProfileSchema } from "@/src/features/student/schemas/student-profile.schema";

export const jobApplicationStudentSchema = createStudentProfileSchema
  .omit({
    emergencyContactName: true,
    emergencyContactPhone: true,
    parentName: true,
    parentPhone: true,
    notes: true,
  })
  .extend({
    lastName: z
      .string()
      .trim()
      .max(100, "Last name cannot exceed 100 characters.")
      .optional()
      .or(z.literal("")),
  });

export type JobApplicationStudentFormValues = z.infer<
  typeof jobApplicationStudentSchema
>;

export interface JobApplicationSubmitResult {
  id: string;
  applicationNumber: string;
  studentId: string | null;
  status: string;
  resumeFileId: string | null;
  createdAt: string;
  student?: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string | null;
  } | null;
  job?: {
    id: string;
    title: string;
    slug: string;
    companyName: string;
    jobNumber?: string | null;
  };
}

const PDF_MIME_TYPES = new Set(["application/pdf"]);

export function validateJobApplicationResumeFile(
  file: File | null,
): string | null {
  if (!file) {
    return "Please upload your resume.";
  }

  const name = file.name.toLowerCase();
  const hasValidExtension = name.endsWith(".pdf");

  if (!PDF_MIME_TYPES.has(file.type) && !hasValidExtension) {
    return "Resume must be a PDF file.";
  }

  if (file.size > 10 * 1024 * 1024) {
    return "Resume must be 10MB or smaller.";
  }

  return null;
}
