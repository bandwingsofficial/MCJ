import type {
  JobApplicationStatus,
} from "@/src/features/job-applications/types/job-application.types";

export const JOB_APPLICATION_STATUSES: readonly JobApplicationStatus[] =
  [
    "UNDER_REVIEW",
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
  UNDER_REVIEW: [
    "SHORTLISTED",
    "SELECTED",
    "REJECTED",
  ],

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

  REJECTED: ["SHORTLISTED", "SELECTED"],
};

export const APPLICATION_STATUS_TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Shortlisted" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export const DEFAULT_APPLICATION_PAGE_SIZE = 20;
