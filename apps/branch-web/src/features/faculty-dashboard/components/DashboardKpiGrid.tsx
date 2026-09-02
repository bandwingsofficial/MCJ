"use client";

import {
  CalendarClock,
  ClipboardList,
  Clock,
  Layers,
  UserCheck,
  Users,
} from "lucide-react";

import type { FacultyDashboardSummary } from "../types/facultyDashboard.types";
import { DASHBOARD_COLORS, DASHBOARD_ROUTES } from "../constants";
import { KpiCard } from "./KpiCard";

interface Props {
  summary: FacultyDashboardSummary;
}

function formatTodaysAttendance(summary: FacultyDashboardSummary) {
  const marked = summary.todaysAttendanceMarked ?? summary.todaysAttendance;
  const expected = summary.todaysAttendanceExpected ?? 0;
  if (expected > 0) {
    return `${marked} / ${expected}`;
  }
  return String(marked);
}

function formatTodaysAttendanceHint(summary: FacultyDashboardSummary) {
  const expected = summary.todaysAttendanceExpected ?? 0;
  if (expected <= 0) return "No sessions today";
  const percent = summary.todaysAttendanceMarkedPercent ?? 0;
  return `${percent}% marked`;
}

export function DashboardKpiGrid({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label="Assigned Batches"
        value={summary.assignedBatches}
        hint="Active assignments"
        href={DASHBOARD_ROUTES.batches}
        icon={Layers}
      />
      <KpiCard
        label="Active Students"
        value={summary.activeStudents}
        hint="Currently enrolled"
        href={DASHBOARD_ROUTES.enrollments}
        icon={Users}
      />
      <KpiCard
        label="Today's Attendance"
        value={formatTodaysAttendance(summary)}
        hint={formatTodaysAttendanceHint(summary)}
        href={DASHBOARD_ROUTES.attendance}
        icon={UserCheck}
        accent={DASHBOARD_COLORS.present}
      />
      <KpiCard
        label="Pending Attendance"
        value={summary.pendingAttendance}
        hint="Sessions awaiting marking"
        href={DASHBOARD_ROUTES.attendance}
        icon={Clock}
        accent={DASHBOARD_COLORS.pending}
      />
      <KpiCard
        label="Upcoming Assessments"
        value={summary.upcomingAssessments}
        hint="Next 14 days"
        href={DASHBOARD_ROUTES.assessments}
        icon={CalendarClock}
      />
      <KpiCard
        label="Recent Assessments"
        value={summary.recentAssessmentsCount}
        hint="Last 30 days"
        href={DASHBOARD_ROUTES.assessments}
        icon={ClipboardList}
      />
    </div>
  );
}
