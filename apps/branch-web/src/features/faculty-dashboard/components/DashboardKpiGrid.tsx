"use client";

import {
  CalendarClock,
  CalendarDays,
  Clock,
  History,
  Layers,
  Sparkles,
} from "lucide-react";

import type {
  FacultyActivityItem,
  FacultyBatchOverviewItem,
  FacultyDashboardSummary,
  FacultyUpcomingSession,
} from "../types/facultyDashboard.types";
import { DASHBOARD_COLORS, DASHBOARD_ROUTES } from "../constants";
import { deriveFacultyDashboardMetrics } from "../utils/faculty-dashboard-metrics.utils";
import { KpiCard } from "./KpiCard";

interface Props {
  summary: FacultyDashboardSummary;
  batchOverview: FacultyBatchOverviewItem[];
  upcomingSessions: FacultyUpcomingSession[];
  recentActivity: FacultyActivityItem[];
}

export function DashboardKpiGrid({
  summary,
  batchOverview,
  upcomingSessions,
  recentActivity,
}: Props) {
  const metrics = deriveFacultyDashboardMetrics(
    summary,
    batchOverview,
    upcomingSessions,
    recentActivity,
  );

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label="Assigned Batches"
        value={metrics.assignedBatches}
        hint="Your assignments"
        href={DASHBOARD_ROUTES.batches}
        icon={Layers}
      />
      <KpiCard
        label="Active Batches"
        value={metrics.activeBatches}
        hint="With students or sessions"
        href={DASHBOARD_ROUTES.batches}
        icon={Sparkles}
        accent="#7C3AED"
      />
      <KpiCard
        label="Today's Sessions"
        value={metrics.todaysSessions}
        hint="Scheduled today"
        href={DASHBOARD_ROUTES.attendance}
        icon={CalendarDays}
        accent={DASHBOARD_COLORS.primary}
      />
      <KpiCard
        label="Pending Attendance"
        value={metrics.pendingAttendance}
        hint="Sessions awaiting marking"
        href={DASHBOARD_ROUTES.attendance}
        icon={Clock}
        accent={DASHBOARD_COLORS.pending}
      />
      <KpiCard
        label="Upcoming Sessions"
        value={metrics.upcomingSessions}
        hint="Next 14 days"
        href={DASHBOARD_ROUTES.batches}
        icon={CalendarClock}
      />
      <KpiCard
        label="Recent Sessions"
        value={metrics.recentSessions}
        hint="In selected period"
        href={DASHBOARD_ROUTES.attendance}
        icon={History}
        accent={DASHBOARD_COLORS.present}
      />
    </div>
  );
}
