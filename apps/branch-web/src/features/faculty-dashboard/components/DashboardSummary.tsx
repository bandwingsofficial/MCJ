"use client";

import type { FacultyDashboardSummary } from "../types/facultyDashboard.types";
import { DASHBOARD_ROUTES } from "../constants";
import { SummaryCard } from "./SummaryCard";

interface Props {
  summary: FacultyDashboardSummary;
}

export function DashboardSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        label="Assigned Batches"
        value={summary.assignedBatches}
        hint="Active assignments"
        href={DASHBOARD_ROUTES.batches}
      />
      <SummaryCard
        label="Active Students"
        value={summary.activeStudents}
        hint="Enrolled students"
        href={DASHBOARD_ROUTES.enrollments}
      />
      <SummaryCard
        label="Today's Attendance"
        value={summary.todaysAttendance}
        hint="Present today"
        href={DASHBOARD_ROUTES.attendance}
      />
      <SummaryCard
        label="Pending Attendance"
        value={summary.pendingAttendance}
        hint="Awaiting mark"
        href={DASHBOARD_ROUTES.attendance}
      />
      <SummaryCard
        label="Upcoming Assessments"
        value={summary.upcomingAssessments}
        hint="Next 14 days"
        href={DASHBOARD_ROUTES.assessments}
      />
      <SummaryCard
        label="Recent Assessments"
        value={summary.recentAssessmentsCount}
        hint="Latest records"
        href={DASHBOARD_ROUTES.assessments}
      />
    </div>
  );
}
