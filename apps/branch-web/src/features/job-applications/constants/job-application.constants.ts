export type JobApplicationScheduleTab = "ALL" | "NOT_SCHEDULED" | "SCHEDULED";

export interface BranchJobApplicationFilters {
  search: string;
  jobId: string;
  roundId: string;
  scheduleTab: JobApplicationScheduleTab;
  page: number;
  pageSize: number;
}

export const DEFAULT_BRANCH_JOB_APPLICATION_FILTERS: BranchJobApplicationFilters =
  {
    search: "",
    jobId: "ALL",
    roundId: "ALL",
    scheduleTab: "ALL",
    page: 1,
    pageSize: 20,
  };

export const BRANCH_JOB_APPLICATION_PAGE_SIZES = [10, 20, 50, 100] as const;

export const DEFAULT_JOB_APPLICATION_SCHEDULE_COUNTS = {
  all: 0,
  notScheduled: 0,
  scheduled: 0,
} as const;
