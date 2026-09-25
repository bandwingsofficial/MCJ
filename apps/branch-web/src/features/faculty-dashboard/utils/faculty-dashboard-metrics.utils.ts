import { toLocalDateInput } from "@/src/features/branch-ops/utils/attendance-date.utils";

import type {
  FacultyActivityItem,
  FacultyBatchOverviewItem,
  FacultyDashboardSummary,
  FacultyUpcomingSession,
} from "../types/facultyDashboard.types";

export interface FacultyDashboardDerivedMetrics {
  assignedBatches: number;
  activeBatches: number;
  todaysSessions: number;
  pendingAttendance: number;
  upcomingSessions: number;
  recentSessions: number;
}

export function deriveFacultyDashboardMetrics(
  summary: FacultyDashboardSummary,
  batchOverview: FacultyBatchOverviewItem[],
  upcomingSessions: FacultyUpcomingSession[],
  recentActivity: FacultyActivityItem[],
): FacultyDashboardDerivedMetrics {
  const today = toLocalDateInput(new Date());
  const upcomingBatchIds = new Set(upcomingSessions.map((session) => session.batchId));

  const activeBatches = batchOverview.filter(
    (batch) =>
      batch.activeStudents > 0 || upcomingBatchIds.has(batch.id),
  ).length;

  const todaysSessions = upcomingSessions.filter(
    (session) => session.date === today,
  ).length;

  const recentSessionsFromOverview = batchOverview.reduce(
    (total, batch) => total + batch.sessionsConducted,
    0,
  );

  const recentSessionsFromActivity = recentActivity.filter(
    (item) => item.type.toLowerCase() === "attendance",
  ).length;

  return {
    assignedBatches: summary.assignedBatches,
    activeBatches,
    todaysSessions,
    pendingAttendance: summary.pendingAttendance,
    upcomingSessions: upcomingSessions.length,
    recentSessions:
      recentSessionsFromOverview > 0
        ? recentSessionsFromOverview
        : recentSessionsFromActivity,
  };
}
