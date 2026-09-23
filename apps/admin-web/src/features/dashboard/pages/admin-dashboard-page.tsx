"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Briefcase,
  CalendarDays,
  GitBranch,
  IndianRupee,
  Layers,
  Plus,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";

import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { DashboardDonutChart } from "@/src/features/dashboard/components/chart/dashboard-donut-chart";
import { DashboardGrowthBarChart } from "@/src/features/dashboard/components/chart/dashboard-growth-bar-chart";
import { DashboardHorizontalBarChart } from "@/src/features/dashboard/components/chart/dashboard-horizontal-bar-chart";
import { DashboardRevenueAreaChart } from "@/src/features/dashboard/components/chart/dashboard-revenue-area-chart";
import { DashboardMetricCard } from "@/src/features/dashboard/components/dashboard-metric-card";
import { DistributionBars } from "@/src/features/dashboard/components/distribution-bars";
import { useAdminDashboard } from "@/src/features/dashboard/hooks/use-admin-dashboard";
import { useDashboardFilters } from "@/src/features/dashboard/hooks/use-dashboard-filters";
import type {
  AdminDashboardData,
  DashboardDatePreset,
} from "@/src/features/dashboard/types/admin-dashboard.types";
import {
  formatCount,
  formatDashboardPeriodLabel,
  formatDateTime,
  formatInr,
  formatRelativeTime,
} from "@/src/features/dashboard/utils/dashboard-date.utils";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

const PRESET_OPTIONS = [
  { value: "TODAY", label: "Today" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "THIS_YEAR", label: "This year" },
  { value: "ALL_TIME", label: "All time" },
  { value: "CUSTOM", label: "Custom range" },
];

const QUICK_ACTIONS = [
  { label: "Create student", href: "/students/create", icon: UserPlus },
  { label: "Create enrollment", href: "/enrollments/create", icon: Layers },
  { label: "Create batch", href: "/batches/create", icon: Boxes },
  { label: "Create course", href: "/courses/create", icon: BookOpen },
  { label: "Add trainer", href: "/trainers", icon: Users },
  { label: "Add branch", href: "/branches", icon: GitBranch },
] as const;

const SCHEDULE_PREVIEW_LIMIT = 5;
const ACTIVITY_PREVIEW_LIMIT = 5;

const ACTIVITY_LIST_ROUTES: Record<string, string> = {
  Enrollment: "/enrollments",
  Student: "/students",
  "Trainer assignment": "/trainers",
  "Job application": "/job-applications",
  Community: "/community",
};

function resolveActivityViewAllHref(
  items: AdminDashboardData["recentActivity"],
): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
  }

  let topType = items[0]?.type ?? "Enrollment";
  let topCount = 0;
  for (const [type, count] of counts) {
    if (count > topCount) {
      topCount = count;
      topType = type;
    }
  }

  return ACTIVITY_LIST_ROUTES[topType] ?? "/enrollments";
}

function resolveScheduleViewAllHref(
  items: AdminDashboardData["upcomingSchedule"],
): string {
  const hasBatchOrTiming = items.some(
    (item) => item.kind === "batch" || item.kind === "timing",
  );
  if (hasBatchOrTiming) {
    return "/batches";
  }
  return "/job-applications";
}

function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function SectionShell({
  title,
  subtitle,
  className,
  headerAction,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#E8EEF5] bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#102A56]">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-[#647A9B]">{subtitle}</p>
          ) : null}
        </div>
        {headerAction ? (
          <div className="shrink-0 pt-0.5">{headerAction}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SectionViewAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] hover:underline"
    >
      View All
    </Link>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    query,
  } = useDashboardFilters("THIS_MONTH");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminDashboard(query);

  const displayName = user?.name?.trim() || "Admin";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#102A56]">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            Academy management overview across students, revenue, batches, and
            branches.
          </p>
          {data?.period ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#2563EB]">
              Showing data for{" "}
              {formatDashboardPeriodLabel(data.period.from, data.period.to)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="grid min-w-[160px] gap-1 text-xs font-medium text-[#647A9B]">
            Period
            <AppSelect
              value={preset}
              onValueChange={(value) =>
                setPreset(value as DashboardDatePreset)
              }
              options={PRESET_OPTIONS}
            />
          </label>
          {preset === "CUSTOM" ? (
            <>
              <label className="grid gap-1 text-xs font-medium text-[#647A9B]">
                From
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="h-9 rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm text-[#102A56]"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-[#647A9B]">
                To
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="h-9 rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm text-[#102A56]"
                />
              </label>
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-9 border-[#DCE8F5]"
            onClick={() => refetch()}
            loading={isFetching}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <SectionShell title="Unable to load dashboard">
          <p className="text-sm text-rose-700">
            {(error as Error)?.message || "Something went wrong."}
          </p>
          <Button type="button" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </SectionShell>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-1">
            <DashboardMetricCard
              label="Total revenue"
              metric={data.metrics.totalRevenue}
              icon={IndianRupee}
              format="currency"
              gradient="bg-gradient-to-br from-[#FFF7ED] via-[#FFFBEB] to-white"
            />
            <DashboardMetricCard
              label="Total job applications"
              metric={data.metrics.totalJobApplications}
              icon={Briefcase}
              href="/job-applications"
              gradient="bg-gradient-to-br from-[#EFF6FF] via-[#F8FBFF] to-white"
            />
            <DashboardMetricCard
              label="Total enrollments"
              metric={data.metrics.totalEnrollments}
              icon={Layers}
              href="/enrollments"
              gradient="bg-gradient-to-br from-[#F5F3FF] via-[#FAF5FF] to-white"
            />
            <DashboardMetricCard
              label="Ongoing batches"
              metric={data.metrics.ongoingBatches}
              icon={Boxes}
              href="/batches"
              gradient="bg-gradient-to-br from-[#ECFDF5] via-[#F6FDF9] to-white"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <SectionShell
              title="Revenue analytics"
              subtitle="Successful payments in the selected period"
              className="xl:col-span-8 bg-gradient-to-br from-[#FFF9F2] via-white to-[#F8FBFF]"
            >
              <div className="mb-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
                    Collected
                  </p>
                  <p className="text-2xl font-bold text-[#102A56]">
                    {formatInr(data.revenue.collectedInPeriod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
                    Pending due
                  </p>
                  <p className="text-2xl font-bold text-[#102A56]">
                    {formatInr(data.revenue.pendingDueTotal)}
                  </p>
                </div>
              </div>
              <DashboardRevenueAreaChart
                data={data.revenue.series.map((point) => ({
                  label: point.date,
                  value: point.amount,
                }))}
                valueFormatter={formatInr}
              />
            </SectionShell>

            <SectionShell
              title="Quick actions"
              className="xl:col-span-4 bg-gradient-to-br from-[#F8FBFF] to-white"
            >
              <div className="grid gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between rounded-xl border border-[#E8EEF5] bg-white px-3 py-2.5 text-sm font-medium text-[#102A56] transition-colors hover:border-[#2563EB]/30 hover:bg-[#F8FBFF]"
                  >
                    <span className="flex items-center gap-2">
                      <action.icon className="h-4 w-4 text-[#2563EB]" />
                      {action.label}
                    </span>
                    <Plus className="h-4 w-4 text-[#94A3B8]" />
                  </Link>
                ))}
              </div>
            </SectionShell>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionShell
              title="Student analytics"
              subtitle={`${formatCount(data.students.activeCount)} active · ${formatCount(data.students.newInPeriod)} new in period`}
              className="bg-gradient-to-br from-[#EFF6FF]/70 to-white"
            >
              <DashboardGrowthBarChart
                data={data.students.growthSeries.map((point) => ({
                  label: point.date,
                  value: point.count,
                }))}
                legendLabel="New registrations by day"
                barColor="#7C3AED"
                barGradientFrom="#C4B5FD"
                valueFormatter={formatCount}
                emptyLabel="No new student registrations in this period."
              />
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {data.students.byStatus.map((row) => (
                  <div
                    key={row.status}
                    className="rounded-lg bg-[#F8FBFF] px-2.5 py-2 ring-1 ring-[#E8EEF5]"
                  >
                    <p className="text-[#647A9B]">{humanizeEnum(row.status)}</p>
                    <p className="font-bold tabular-nums text-[#102A56]">
                      {formatCount(row.count)}
                    </p>
                  </div>
                ))}
                <div className="rounded-lg bg-[#F8FBFF] px-2.5 py-2 ring-1 ring-[#E8EEF5]">
                  <p className="text-[#647A9B]">Archived / deleted</p>
                  <p className="font-bold tabular-nums text-[#102A56]">
                    {formatCount(data.students.archivedCount)}
                  </p>
                </div>
              </div>
            </SectionShell>

            <SectionShell
              title="Enrollment analytics"
              subtitle={`${formatCount(data.enrollments.active)} active · ${formatCount(data.enrollments.newInPeriod)} new`}
              className="bg-gradient-to-br from-[#FAF5FF]/60 to-white"
            >
              <DashboardGrowthBarChart
                data={data.enrollments.trendSeries.map((point) => ({
                  label: point.date,
                  value: point.count,
                }))}
                legendLabel="New enrollments by day"
                barColor="#059669"
                barGradientFrom="#6EE7B7"
                valueFormatter={formatCount}
                emptyLabel="No new enrollments in this period."
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
                    Status
                  </p>
                  <DistributionBars
                    items={data.enrollments.byStatus.map((row) => ({
                      label: humanizeEnum(row.status),
                      count: row.count,
                    }))}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
                    Payment status
                  </p>
                  <DistributionBars
                    items={data.enrollments.byPaymentStatus.map((row) => ({
                      label: humanizeEnum(row.status),
                      count: row.count,
                    }))}
                  />
                </div>
              </div>
            </SectionShell>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <SectionShell
              title="Batch analytics"
              subtitle="Lifecycle and learning modes"
              className="xl:col-span-7 bg-gradient-to-br from-[#ECFDF5]/50 to-white"
            >
              <div className="mb-4 flex flex-wrap gap-3 text-sm">
                <BatchPill label="Upcoming" value={data.batches.upcoming} tone="blue" />
                <BatchPill label="Ongoing" value={data.batches.ongoing} tone="green" />
                <BatchPill label="Expired" value={data.batches.expired} tone="slate" />
              </div>
              <DashboardDonutChart
                segments={data.batches.modeDistribution.map((row) => ({
                  label: row.modeLabel,
                  value: row.count,
                }))}
                centerLabel="Modes"
                emptyLabel="No batch mode data yet."
              />
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
                  Upcoming batches
                </p>
                {data.batches.upcomingList.length === 0 ? (
                  <p className="text-sm text-[#647A9B]">No upcoming batches scheduled.</p>
                ) : (
                  data.batches.upcomingList.slice(0, 5).map((batch) => (
                    <Link
                      key={batch.id}
                      href={`/batches/${batch.id}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-[#E8EEF5] bg-[#FAFFFE] px-3 py-2.5 hover:border-[#2563EB]/25"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#102A56]">
                          {batch.batchName}
                        </p>
                        <p className="truncate text-xs text-[#647A9B]">
                          {batch.courseTitle ?? "Course"} · {batch.modeLabel}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {formatDateTime(batch.startDate)}
                          {batch.endDate
                            ? ` → ${formatDateTime(batch.endDate)}`
                            : ""}
                          {" · "}
                          {batch.startTime}–{batch.endTime}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#94A3B8]" />
                    </Link>
                  ))
                )}
              </div>
            </SectionShell>

            <SectionShell
              title="Branch performance"
              subtitle={`${formatCount(data.branches.active)} active of ${formatCount(data.branches.total)} branches`}
              className="xl:col-span-5 bg-gradient-to-br from-[#FFF7ED]/40 to-white"
            >
              <DashboardHorizontalBarChart
                legendLabel="Enrollments by branch"
                valueLabel="Enrollments"
                items={data.branches.enrollmentDistribution.map((row) => ({
                  label: row.branchName,
                  value: row.enrollmentCount,
                }))}
                emptyLabel="No branch enrollment data yet."
              />
            </SectionShell>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionShell
              title="Course analytics"
              subtitle={`${formatCount(data.courses.active)} active courses`}
              className="bg-gradient-to-br from-[#F8FBFF] to-white"
            >
              <div className="mb-3 flex gap-4 text-sm">
                <span className="text-[#647A9B]">
                  Total{" "}
                  <strong className="text-[#102A56]">
                    {formatCount(data.courses.total)}
                  </strong>
                </span>
              </div>
              <DashboardHorizontalBarChart
                legendLabel="Top courses by enrollments"
                valueLabel="Enrollments"
                items={(data.courses.topByEnrollments ?? [])
                  .filter(Boolean)
                  .map((course) => ({
                    label: course.title,
                    value: course.enrollmentCount,
                  }))}
                emptyLabel="No enrollment-linked courses yet."
              />
            </SectionShell>

            <SectionShell
              title="Trainer analytics"
              subtitle="Assignments across branches and batches"
              className="bg-gradient-to-br from-[#F5F3FF]/50 to-white"
            >
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Active trainers" value={data.trainers.active} />
                <MiniStat label="Total trainers" value={data.trainers.total} />
                <MiniStat
                  label="Branch assignments"
                  value={data.trainers.withBranchAssignments}
                />
                <MiniStat
                  label="Batch assignments"
                  value={data.trainers.batchAssignments}
                />
              </div>
            </SectionShell>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <SectionShell
              title="Recent activity"
              className="xl:col-span-7"
              headerAction={
                data.recentActivity.length > ACTIVITY_PREVIEW_LIMIT ? (
                  <SectionViewAllLink
                    href={resolveActivityViewAllHref(data.recentActivity)}
                  />
                ) : undefined
              }
            >
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-[#647A9B]">No recent activity yet.</p>
              ) : (
                <ul className="divide-y divide-[#EEF2F8]">
                  {data.recentActivity
                    .slice(0, ACTIVITY_PREVIEW_LIMIT)
                    .map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-start justify-between gap-3 py-3 hover:bg-[#FAFCFF]"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
                            {item.type}
                          </p>
                          <p className="font-medium text-[#102A56]">{item.title}</p>
                          <p className="truncate text-xs text-[#647A9B]">
                            {item.subtitle}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-[#94A3B8]">
                          {formatRelativeTime(item.occurredAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionShell>

            <SectionShell
              title="Upcoming schedule"
              className="xl:col-span-5 bg-gradient-to-br from-[#FFFBEB]/50 to-white"
              headerAction={
                data.upcomingSchedule.length > SCHEDULE_PREVIEW_LIMIT ? (
                  <SectionViewAllLink
                    href={resolveScheduleViewAllHref(data.upcomingSchedule)}
                  />
                ) : undefined
              }
            >
              <div className="mb-2 flex items-center gap-2 text-xs text-[#647A9B]">
                <CalendarDays className="h-4 w-4" />
                Batch starts, timings, and interviews
              </div>
              {data.upcomingSchedule.length === 0 ? (
                <p className="text-sm text-[#647A9B]">
                  Nothing scheduled in the near term.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.upcomingSchedule
                    .slice(0, SCHEDULE_PREVIEW_LIMIT)
                    .map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="block rounded-xl border border-[#E8EEF5] px-3 py-2.5 hover:border-[#2563EB]/25 hover:bg-[#F8FBFF]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-[#102A56]">{item.title}</p>
                          {item.kind === "interview" ? (
                            <Briefcase className="h-4 w-4 text-[#EA580C]" />
                          ) : (
                            <Boxes className="h-4 w-4 text-[#2563EB]" />
                          )}
                        </div>
                        <p className="text-xs text-[#647A9B]">{item.subtitle}</p>
                        <p className="mt-1 text-xs font-medium text-[#2563EB]">
                          {formatDateTime(item.startsAt)}
                          {item.timeLabel ? ` · ${item.timeLabel}` : ""}
                        </p>
                        {item.modeLabel ? (
                          <p className="text-[11px] text-[#94A3B8]">{item.modeLabel}</p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionShell>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardMetricCard
              label="Total courses"
              metric={data.metrics.totalCourses}
              icon={BookOpen}
              href="/courses"
              gradient="bg-gradient-to-br from-[#F8FBFF] to-white"
            />
            <DashboardMetricCard
              label="Active trainers"
              metric={data.metrics.activeTrainers}
              icon={Users}
              href="/trainers"
              gradient="bg-gradient-to-br from-[#FAF5FF] to-white"
            />
            <DashboardMetricCard
              label="Total branches"
              metric={data.metrics.totalBranches}
              icon={GitBranch}
              href="/branches"
              gradient="bg-gradient-to-br from-[#FFF7ED] to-white"
            />
            <DashboardMetricCard
              label="Expired batches"
              metric={data.metrics.expiredBatches}
              icon={Boxes}
              href="/batches"
              gradient="bg-gradient-to-br from-[#F1F5F9] to-white"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#E8EEF5] bg-white px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-[#102A56]">
        {formatCount(value)}
      </p>
    </div>
  );
}

function BatchPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "slate";
}) {
  const tones = {
    blue: "bg-[#EFF6FF] text-[#1D4ED8]",
    green: "bg-[#ECFDF5] text-[#047857]",
    slate: "bg-[#F1F5F9] text-[#475569]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {label}
      <span className="tabular-nums">{formatCount(value)}</span>
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[118px] min-h-[118px] animate-pulse rounded-2xl bg-[#EEF2F8]"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-[#EEF2F8]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-[#EEF2F8]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#EEF2F8]" />
      </div>
    </div>
  );
}
