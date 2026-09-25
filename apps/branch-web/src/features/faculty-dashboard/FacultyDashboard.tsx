"use client";

import { useMemo } from "react";

import { formatBatchStatus } from "@/src/features/branch-ops/utils/batch-display";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { AssessmentPerformance } from "./components/AssessmentPerformance";
import { AttendanceOverview } from "./components/AttendanceOverview";
import { BatchOverview } from "./components/BatchOverview";
import { DashboardFilters } from "./components/DashboardFilters";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardKpiGrid } from "./components/DashboardKpiGrid";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { RecentActivity } from "./components/RecentActivity";
import { StudentsAttention } from "./components/StudentsAttention";
import { UpcomingSessions } from "./components/UpcomingSessions";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useFacultyDashboard } from "./hooks/useFacultyDashboard";

export function FacultyDashboard() {
  const {
    filters,
    queryParams,
    batchOptions,
    sessionOptions,
    updateFilters,
    clearFilters,
  } = useDashboardFilters();

  const dashboardQuery = useFacultyDashboard(queryParams);
  const data = dashboardQuery.data;

  const assessmentTypeOptions = useMemo(
    () => [
      { label: "All Types", value: "ALL" },
      ...(data?.assessmentTypes ?? []).map((type) => ({
        label: formatBatchStatus(type),
        value: type,
      })),
    ],
    [data?.assessmentTypes],
  );

  if (dashboardQuery.loading && !data) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-5 pb-4">
        <DashboardHeader
          refreshing={dashboardQuery.loading}
          onRefresh={() => void dashboardQuery.reload()}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (dashboardQuery.error && !data) {
    return (
      <ErrorState
        description={
          dashboardQuery.error ??
          "Unable to load dashboard data. Please try again."
        }
        onRetry={dashboardQuery.reload}
      />
    );
  }

  if (!data?.summary) {
    return (
      <ErrorState
        description="No dashboard data available."
        onRetry={dashboardQuery.reload}
      />
    );
  }

  const batchOverview = data.batchOverview ?? [];
  const upcomingSessions = data.upcomingSessions ?? [];
  const recentActivity = data.recentActivity ?? [];

  return (
    <div
      className={`mx-auto max-w-[1400px] pb-4 transition-opacity ${dashboardQuery.loading ? "opacity-80" : ""}`}
    >
      <DashboardHeader
        lastUpdated={data.lastUpdated}
        refreshing={dashboardQuery.loading}
        onRefresh={() => void dashboardQuery.reload()}
      />

      <div className="mt-5 space-y-5">
        <DashboardFilters
          filters={filters}
          batchOptions={batchOptions}
          sessionOptions={sessionOptions}
          assessmentTypeOptions={assessmentTypeOptions}
          onChange={updateFilters}
          onClear={clearFilters}
        />

        <DashboardKpiGrid
          summary={data.summary}
          batchOverview={batchOverview}
          upcomingSessions={upcomingSessions}
          recentActivity={recentActivity}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <BatchOverview
            batches={batchOverview}
            upcomingSessions={upcomingSessions}
          />
          <UpcomingSessions sessions={upcomingSessions} />
        </div>

        <StudentsAttention students={data.studentsRequiringAttention ?? []} />

        <AttendanceOverview
          trend={data.attendanceTrend ?? []}
          summary={data.attendanceSummary}
        />

        <AssessmentPerformance performance={data.assessmentPerformance} />

        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}
