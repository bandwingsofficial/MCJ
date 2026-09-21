export type BranchJobApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "SELECTED"
  | "PLACED"
  | "REJECTED";

export type InterviewPhaseFilter = "ALL" | "ASSIGNED" | "SCHEDULED";

export interface BranchJobApplicationFilters {
  search: string;
  status: string;
  jobId: string;
  interviewPhase: InterviewPhaseFilter;
  appliedFrom: string;
  appliedTo: string;
  page: number;
  pageSize: number;
}

export const DEFAULT_BRANCH_JOB_APPLICATION_FILTERS: BranchJobApplicationFilters =
  {
    search: "",
    status: "ALL",
    jobId: "ALL",
    interviewPhase: "ALL",
    appliedFrom: "",
    appliedTo: "",
    page: 1,
    pageSize: 20,
  };

export const BRANCH_JOB_APPLICATION_STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Selected", value: "SELECTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Placed", value: "PLACED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Applied", value: "APPLIED" },
  { label: "Assessment", value: "ASSESSMENT" },
] as const;

export const BRANCH_INTERVIEW_PHASE_OPTIONS = [
  { label: "All Assignment / Interview", value: "ALL" },
  { label: "Assigned (Not Scheduled)", value: "ASSIGNED" },
  { label: "Scheduled", value: "SCHEDULED" },
] as const;

export const BRANCH_JOB_APPLICATION_PAGE_SIZES = [10, 20, 50, 100] as const;
