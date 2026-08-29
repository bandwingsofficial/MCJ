import type {
  EmploymentType,
  JobLifecycleStatus,
  JobOnboardingStatusFilter,
  JobWorkMode,
  WorkingDays,
} from "@/src/features/jobs/types/job.types";

export const DEFAULT_JOB_PAGE_SIZE = 20;

export const EMPLOYMENT_TYPES: {
  value: EmploymentType;
  label: string;
}[] = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

export const WORKING_DAYS: {
  value: WorkingDays;
  label: string;
}[] = [
  { value: "MONDAY_TO_FRIDAY", label: "Monday to Friday" },
  { value: "MONDAY_TO_SATURDAY", label: "Monday to Saturday" },
  { value: "FIVE_DAYS", label: "Five Days" },
  { value: "SIX_DAYS", label: "Six Days" },
  { value: "ONE_DAY", label: "One Day" },
  { value: "TWO_DAYS", label: "Two Days" },
  { value: "THREE_DAYS", label: "Three Days" },
  { value: "FOUR_DAYS", label: "Four Days" },
];

export const WORK_MODES: {
  value: JobWorkMode;
  label: string;
}[] = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

export const JOB_CATEGORIES = [
  "Information Technology",
  "Finance",
  "Accounting",
  "Sales",
  "Marketing",
  "Human Resources",
  "Operations",
  "Education",
  "Healthcare",
  "Customer Support",
  "Other",
] as const;

export const JOB_QUALIFICATIONS = [
  "10th",
  "12th",
  "Diploma",
  "ITI",
  "Graduate",
  "Post Graduate",
  "Any Degree",
  "BCA",
  "B.E / B.Tech",
  "BBA",
  "B.Com",
  "MCA",
  "MBA",
] as const;

export const JOB_LIFECYCLE_STATUS_OPTIONS: {
  value: JobLifecycleStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

export const JOB_ONBOARDING_STATUS_OPTIONS: {
  value: JobOnboardingStatusFilter;
  label: string;
}[] = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

export const MIN_JOB_SALARY = 15000;

export const JOB_IMAGE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const JOB_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
