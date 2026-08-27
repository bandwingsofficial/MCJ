import type { FieldVisualState } from "@/src/shared/components/ui/validated-field";

import {
  JOB_IMAGE_ACCEPT,
  JOB_IMAGE_MAX_BYTES,
} from "@/src/features/jobs/constants/job.constants";
import type { CreateJobFormValues } from "@/src/features/jobs/schemas/job.schema";
import type { CreateJobRequest, Job } from "@/src/features/jobs/types/job.types";

export function getSyncFieldState(
  touched: boolean,
  error?: string,
  value?: string,
  options?: { required?: boolean },
): FieldVisualState {
  if (!touched) {
    return "neutral";
  }

  if (error) {
    return "invalid";
  }

  if (options?.required) {
    return value?.trim() ? "valid" : "neutral";
  }

  if (value?.trim()) {
    return "valid";
  }

  return "neutral";
}

export function parseSalaryInput(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return undefined;
  }

  return Number(digits);
}

export function formatSalaryInput(value?: number): string {
  if (value == null || Number.isNaN(value)) {
    return "";
  }

  return value.toLocaleString("en-IN");
}

export function formatInr(value?: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

export function stringToArray(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function arrayToString(values?: string[] | null): string {
  return (values ?? []).join("\n");
}

export function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function tomorrowDateInputValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function createDefaultJobFormValues(): CreateJobFormValues {
  return {
    title: "",
    companyName: "MCJ Institute",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    companyDescription: "",
    companyLogo: "",
    shortDescription: "",
    description: "",
    responsibilities: "",
    benefits: "",
    location: "",
    city: "",
    state: "",
    country: "India",
    category: "",
    department: "",
    workMode: "ONSITE",
    employmentType: "FULL_TIME",
    workingDays: "MONDAY_TO_FRIDAY",
    minExperience: 0,
    maxExperience: 0,
    minSalary: undefined as unknown as number,
    maxSalary: undefined as unknown as number,
    salaryCurrency: "INR",
    vacancies: 1,
    applicationDeadline: "",
    skills: [],
    preferredSkills: [],
    qualifications: [],
    interviewNotes: "",
  };
}

export function jobToFormValues(job: Job): CreateJobFormValues {
  return {
    title: job.title ?? "",
    companyName: job.companyName ?? "",
    companyEmail: job.companyEmail ?? "",
    companyPhone: job.companyPhone ?? "",
    companyWebsite: job.companyWebsite ?? "",
    companyDescription: job.companyDescription ?? "",
    companyLogo: job.companyLogo ?? "",
    shortDescription: job.shortDescription ?? "",
    description: job.description ?? "",
    responsibilities: arrayToString(job.responsibilities),
    benefits: job.benefits ?? "",
    location: job.location ?? "",
    city: job.city ?? "",
    state: job.state ?? "",
    country: job.country ?? "India",
    category: job.category ?? "",
    department: job.department ?? "",
    workMode: job.workMode ?? (job.isRemote ? "REMOTE" : "ONSITE"),
    employmentType: job.employmentType,
    workingDays: job.workingDays,
    minExperience: job.minExperience ?? 0,
    maxExperience: job.maxExperience ?? 0,
    minSalary: job.minSalary ?? (undefined as unknown as number),
    maxSalary: job.maxSalary ?? (undefined as unknown as number),
    salaryCurrency: job.salaryCurrency || "INR",
    vacancies: job.vacancies ?? 1,
    applicationDeadline: toDateInputValue(job.applicationDeadline),
    skills: job.skills ?? [],
    preferredSkills: job.preferredSkills ?? [],
    qualifications: job.qualifications ?? [],
    interviewNotes: job.interviewProcess?.[0]?.description ?? "",
  };
}

export function formValuesToCreateRequest(
  formValues: CreateJobFormValues,
  options?: { removeLogo?: boolean },
): CreateJobRequest {
  return {
    title: formValues.title,
    companyName: formValues.companyName,
    companyEmail: formValues.companyEmail,
    companyPhone: formValues.companyPhone || undefined,
    companyWebsite: formValues.companyWebsite || undefined,
    companyDescription: formValues.companyDescription || undefined,
    companyLogo: options?.removeLogo ? "" : formValues.companyLogo || undefined,
    description: formValues.description,
    shortDescription: formValues.shortDescription || undefined,
    location: formValues.location,
    city: formValues.city || undefined,
    state: formValues.state || undefined,
    country: formValues.country || "India",
    workMode: formValues.workMode,
    employmentType: formValues.employmentType,
    workingDays: formValues.workingDays,
    category: formValues.category,
    department: formValues.department || undefined,
    minExperience: Number.isFinite(formValues.minExperience)
      ? formValues.minExperience
      : 0,
    maxExperience: Number.isFinite(formValues.maxExperience)
      ? formValues.maxExperience
      : formValues.minExperience || 0,
    minSalary: formValues.minSalary,
    maxSalary: formValues.maxSalary,
    salaryCurrency: formValues.salaryCurrency || "INR",
    vacancies: formValues.vacancies || 1,
    applicationDeadline: formValues.applicationDeadline,
    responsibilities: stringToArray(formValues.responsibilities),
    skills: formValues.skills,
    preferredSkills: formValues.preferredSkills ?? [],
    qualifications: formValues.qualifications,
    benefits: formValues.benefits || undefined,
    interviewProcess: formValues.interviewNotes?.trim()
      ? [
          {
            title: "Interview Process",
            description: formValues.interviewNotes.trim(),
          },
        ]
      : [],
    status: "ACTIVE",
  };
}

export function validateJobImageFile(file: File): string | null {
  if (
    !JOB_IMAGE_ACCEPT.includes(
      file.type as (typeof JOB_IMAGE_ACCEPT)[number],
    )
  ) {
    return "Please upload a PNG, JPG, or WEBP image.";
  }

  if (file.size > JOB_IMAGE_MAX_BYTES) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

export function getCustomerWebOrigin(): string {
  const origin =
    process.env.NEXT_PUBLIC_CUSTOMER_WEB_URL?.trim() ||
    "http://localhost:3000";

  return origin.replace(/\/$/, "");
}

export function getJobApplicationUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/jobs/${encodeURIComponent(slug)}/apply`;
  }

  return `/jobs/${encodeURIComponent(slug)}/apply`;
}

export function getCompanyOnboardingUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/onboarding/job`;
  }

  return "/onboarding/job";
}

export function getOnboardingStatusLabel(status: Job["status"]): string {
  if (status === "PENDING_APPROVAL") {
    return "Pending";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  return "Accepted";
}
