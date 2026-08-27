import type {
  EmploymentType,
  JobWorkMode,
  WorkingDays,
} from "@/src/features/jobs/types/job.types";

export const JOB_QUERY_KEY = ["jobs"] as const;

export const JOB_DETAIL_QUERY_KEY = (slug: string) =>
  ["jobs", "detail", slug] as const;

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

export const MIN_JOB_SALARY = 15000;
