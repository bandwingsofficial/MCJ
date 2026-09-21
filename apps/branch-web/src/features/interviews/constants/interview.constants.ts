export type InterviewTab =
  | "UPCOMING"
  | "TODAY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface BranchInterviewFilters {
  search: string;
  interviewerId: string;
  mode: string;
  roundId: string;
  status: string;
  from: string;
  to: string;
  tab: InterviewTab;
  page: number;
  pageSize: number;
}

export const DEFAULT_BRANCH_INTERVIEW_FILTERS: BranchInterviewFilters = {
  search: "",
  interviewerId: "ALL",
  mode: "ALL",
  roundId: "ALL",
  status: "ALL",
  from: "",
  to: "",
  tab: "UPCOMING",
  page: 1,
  pageSize: 20,
};

export const BRANCH_INTERVIEW_PAGE_SIZES = [10, 20, 50, 100] as const;

export const BRANCH_INTERVIEW_MODE_OPTIONS = [
  { label: "All Modes", value: "ALL" },
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
] as const;

export const BRANCH_INTERVIEW_STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "No Show", value: "NO_SHOW" },
] as const;