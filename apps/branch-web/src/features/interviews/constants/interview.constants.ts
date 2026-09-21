export type InterviewTab = "UPCOMING" | "TODAY" | "COMPLETED" | "CANCELLED";

export interface BranchInterviewFilters {
  search: string;
  interviewerId: string;
  mode: string;
  roundNumber: string;
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
  roundNumber: "ALL",
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

export const BRANCH_INTERVIEW_ROUND_OPTIONS = [
  { label: "All Rounds", value: "ALL" },
  { label: "Round 1", value: "1" },
  { label: "Round 2", value: "2" },
  { label: "Round 3", value: "3" },
] as const;
