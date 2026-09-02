export type {
  DashboardData as FacultyDashboardData,
  FacultyActivityItem,
  FacultyAssessmentPerformance,
  FacultyAttendanceSummary,
  FacultyAttendanceTrendPoint,
  FacultyBatchOverviewItem,
  FacultyDashboardSummary,
  FacultyStudentAttentionItem,
  FacultyUpcomingSession,
} from "@/src/features/branch-ops/types";

export type DashboardDatePreset =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "CUSTOM";

export interface DashboardFilterState {
  datePreset: DashboardDatePreset;
  customFrom: string;
  customTo: string;
  batchId: string;
  batchCourseId: string;
  assessmentType: string;
}

export interface DashboardQueryParams {
  from?: string;
  to?: string;
  batchId?: string;
  batchCourseId?: string;
  assessmentType?: string;
}
