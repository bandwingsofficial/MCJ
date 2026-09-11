export const JOB_APPLICATION_FILTER_ALL = "ALL";

export const INTERVIEW_STATUS_FILTER_OPTIONS = [
  { label: "All", value: JOB_APPLICATION_FILTER_ALL },
  { label: "Not Yet", value: "NOT_YET" },
  { label: "Interview Scheduled", value: "INTERVIEW_SCHEDULED" },
  { label: "Interviewed", value: "INTERVIEWED" },
  { label: "Selected", value: "SELECTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Placed", value: "PLACED" },
] as const;

export const DEFAULT_JOB_APPLICATION_FILTERS = {
  search: "",
  status: "PENDING" as const,
  jobId: undefined as string | undefined,
  interviewStatus: undefined as
    | import("@/src/features/job-applications/types/job-application.types").JobApplicationInterviewStatus
    | undefined,
  appliedFrom: "",
  appliedTo: "",
  page: 1,
  pageSize: 20,
};
