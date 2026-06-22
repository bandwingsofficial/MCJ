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
  ],

  SHORTLISTED: [
    "ASSESSMENT",
  ],

  ASSESSMENT: [
    "INTERVIEW",
  ],

  INTERVIEW: [
    "SELECTED",
  ],

  SELECTED: [
    "PLACED",
  ],

  PLACED: [],
};