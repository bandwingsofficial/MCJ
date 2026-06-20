import type {
  EmploymentType,
  JobStatus,
  WorkingDays,
} from "@/src/features/jobs/types/job.types";

export const EMPLOYMENT_TYPES: {
  value: EmploymentType;
  label: string;
}[] = [
  {
    value: "FULL_TIME",
    label: "Full Time",
  },
  {
    value: "PART_TIME",
    label: "Part Time",
  },
  {
    value: "CONTRACT",
    label: "Contract",
  },
  {
    value: "INTERNSHIP",
    label: "Internship",
  },
  {
    value: "FREELANCE",
    label: "Freelance",
  },
];

export const WORKING_DAYS: {
  value: WorkingDays;
  label: string;
}[] = [
  {
    value: "MONDAY_TO_FRIDAY",
    label: "Monday to Friday",
  },
  {
    value: "MONDAY_TO_SATURDAY",
    label: "Monday to Saturday",
  },
  {
    value: "FLEXIBLE",
    label: "Flexible",
  },
];

export const JOB_STATUS_OPTIONS: {
  value: JobStatus;
  label: string;
}[] = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "CLOSED",
    label: "Closed",
  },
  {
    value: "EXPIRED",
    label: "Expired",
  },
];