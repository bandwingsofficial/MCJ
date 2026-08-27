import type {
  JobApplicationStatus,
} from "@/src/features/job-applications/types/job-application.types";

export const JOB_APPLICATION_STATUSES: readonly JobApplicationStatus[] =
  [
    "APPLIED",
    "SHORTLISTED",
    "ASSESSMENT",
    "INTERVIEW",
    "SELECTED",
    "PLACED",
  ];

export const JOB_APPLICATION_STATUS_OPTIONS =
  JOB_APPLICATION_STATUSES.map(
    (status) => ({
      label: status,
      value: status,
    }),
  );

export const JOB_APPLICATION_STATUS_FLOW: Record<
  JobApplicationStatus,
  JobApplicationStatus[]
> = {
  APPLIED: [
    "SHORTLISTED",
    "SELECTED",
    "REJECTED",
  ],

  SHORTLISTED: [
    "ASSESSMENT",
    "REJECTED",
  ],

  ASSESSMENT: [
    "INTERVIEW",
    "REJECTED",
  ],

  INTERVIEW: [
    "SELECTED",
    "REJECTED",
  ],

  SELECTED: [
    "PLACED",
    "REJECTED",
  ],

  PLACED: [],

  REJECTED: [],
};

export const DEFAULT_APPLICATION_PAGE_SIZE = 20;

export const ONBOARDING_STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
] as const;