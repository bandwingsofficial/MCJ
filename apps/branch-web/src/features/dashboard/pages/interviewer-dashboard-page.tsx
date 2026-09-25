"use client";

import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  PauseCircle,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { resolvePortalBranchName } from "@/src/features/auth/utils/current-branch-display.util";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  DashboardData,
  InterviewerDashboardMetrics,
} from "@/src/features/branch-ops/types";
import { DashboardMetricCard } from "@/src/features/dashboard/components/dashboard-metric-card";
import { formatCount, formatDateTime } from "@/src/features/dashboard/utils/dashboard-date.utils";
import { useCurrentBranchId } from "@/src/features/auth/hooks/use-current-branch";
import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { cn } from "@/src/shared/lib/cn";

function metricValue(count: number) {
  return { value: count };
}

function WorkflowStep({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "border-[#E8EEF5] bg-white text-[#102A56]",
    success: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
    warning: "border-amber-100 bg-amber-50/80 text-amber-900",
    danger: "border-rose-100 bg-rose-50/80 text-rose-900",
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 text-center shadow-sm",
        tones[tone],
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums">{formatCount(value)}</p>
    </div>
  );
}

function isInterviewerDashboard(
  data: DashboardData,
): data is DashboardData & {
  metrics: InterviewerDashboardMetrics;
} {
  return Boolean(data.metrics?.newApplications != null);
}

export function InterviewerDashboardPage() {
  const { user } = useAuth();
  const branchId = useCurrentBranchId();
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.dashboard(),
    [branchId],
  );

  const displayName = user
    ? `${user.firstName} ${user.lastName ?? ""}`.trim() || "Interviewer"
    : "Interviewer";
  const branchLabel = resolvePortalBranchName(
    user?.branch ?? null,
    data?.branch,
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data || !isInterviewerDashboard(data)) {
    return <ErrorState description="No interviewer dashboard data." onRetry={reload} />;
  }

  const m = data.metrics;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#102A56]">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            Manage your interviews and applications
          </p>
          {branchLabel !== "—" ? (
            <p className="mt-1 text-sm font-semibold text-[#2563EB]">
              {branchLabel}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 border-[#DCE8F5]"
          onClick={() => reload()}
          loading={loading}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {data.alerts && data.alerts.length > 0 ? (
        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <div
              key={alert.key}
              className={cn(
                "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
                alert.severity === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-[#DCE8F5] bg-[#F8FBFF] text-[#102A56]",
              )}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
              {alert.message}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label="New applications"
          metric={metricValue(m.newApplications)}
          icon={Briefcase}
          href="/job-applications"
          gradient="bg-gradient-to-br from-[#EFF6FF] via-[#F8FBFF] to-white"
        />
        <DashboardMetricCard
          label="Pending interviews"
          metric={metricValue(m.pendingInterviews)}
          icon={Clock}
          href="/interviews"
          gradient="bg-gradient-to-br from-[#FFF7ED] via-[#FFFBEB] to-white"
        />
        <DashboardMetricCard
          label="Scheduled interviews"
          metric={metricValue(m.scheduledInterviews)}
          icon={CalendarClock}
          href="/interviews"
          gradient="bg-gradient-to-br from-[#ECFDF5] via-[#F6FDF9] to-white"
        />
        <DashboardMetricCard
          label="Today's interviews"
          metric={metricValue(m.todaysInterviews)}
          icon={CalendarClock}
          href="/interviews"
          gradient="bg-gradient-to-br from-[#F5F3FF] via-[#FAF5FF] to-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label="Upcoming interviews"
          metric={metricValue(m.upcomingInterviews)}
          icon={CalendarClock}
          href="/interviews"
          gradient="bg-gradient-to-br from-[#F8FBFF] to-white"
        />
        <DashboardMetricCard
          label="Completed interviews"
          metric={metricValue(m.completedInterviews)}
          icon={CheckCircle2}
          href="/interviews"
          gradient="bg-gradient-to-br from-[#EFF6FF]/70 to-white"
        />
        <DashboardMetricCard
          label="Selected / next round"
          metric={metricValue(m.selectedNextRound)}
          icon={UserCheck}
          href="/job-applications"
          gradient="bg-gradient-to-br from-[#ECFDF5]/80 to-white"
        />
        <DashboardMetricCard
          label="Rejected candidates"
          metric={metricValue(m.rejectedCandidates)}
          icon={UserX}
          href="/job-applications"
          gradient="bg-gradient-to-br from-[#FFF1F2] to-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DashboardMetricCard
          label="Placed candidates"
          metric={metricValue(m.placedCandidates)}
          icon={Users}
          href="/job-applications"
          gradient="bg-gradient-to-br from-[#ECFDF5] to-white"
        />
        <DashboardMetricCard
          label="On hold"
          metric={metricValue(m.onHold)}
          icon={PauseCircle}
          href="/job-applications"
          gradient="bg-gradient-to-br from-[#FFFBEB] to-white"
        />
        <DashboardMetricCard
          label="Need further review"
          metric={metricValue(m.needFurtherReview)}
          icon={Search}
          href="/job-applications"
          gradient="bg-gradient-to-br from-[#F5F3FF] to-white"
        />
      </div>

      <section className="rounded-2xl border border-[#E8EEF5] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#102A56]">Interview workflow</h2>
        <p className="mt-0.5 text-sm text-[#647A9B]">
          Your assigned applications at {branchLabel} — from scheduling through
          outcomes.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <WorkflowStep label="Assigned" value={m.newApplications} />
          <WorkflowStep label="Pending" value={m.pendingInterviews} />
          <WorkflowStep label="Scheduled" value={m.scheduledInterviews} />
          <WorkflowStep label="Today" value={m.todaysInterviews} tone="warning" />
          <WorkflowStep
            label="Upcoming"
            value={m.upcomingInterviews}
            tone="default"
          />
          <WorkflowStep
            label="Completed"
            value={m.completedInterviews}
            tone="success"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <WorkflowStep
            label="Next round"
            value={m.selectedNextRound}
            tone="success"
          />
          <WorkflowStep label="Rejected" value={m.rejectedCandidates} tone="danger" />
          <WorkflowStep label="Placed" value={m.placedCandidates} tone="success" />
          <WorkflowStep label="On hold / review" value={m.onHold + m.needFurtherReview} />
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8EEF5] bg-gradient-to-br from-[#FFFBEB]/40 to-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#102A56]">
              Upcoming schedule
            </h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Interviews assigned to you at this branch
            </p>
          </div>
          <Link
            href="/interviews"
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View all
          </Link>
        </div>
        {!data.upcomingSchedule?.length ? (
          <p className="text-sm text-[#647A9B]">No upcoming interviews scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {data.upcomingSchedule.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="block rounded-xl border border-[#E8EEF5] bg-white px-3 py-2.5 transition-colors hover:border-[#2563EB]/25 hover:bg-[#F8FBFF]"
                >
                  <p className="font-medium text-[#102A56]">{item.title}</p>
                  <p className="text-xs text-[#647A9B]">
                    {item.subtitle}
                    {item.roundLabel ? ` · ${item.roundLabel}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#2563EB]">
                    {formatDateTime(item.scheduledAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
