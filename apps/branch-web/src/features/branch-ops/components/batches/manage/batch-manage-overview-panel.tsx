"use client";

import { useMemo } from "react";
import { MonitorPlay } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { useCurrentBranch } from "@/src/features/auth/hooks/use-current-branch";
import { resolvePortalBranchName } from "@/src/features/auth/utils/current-branch-display.util";
import type {
  BatchListItem,
  BatchSummary,
} from "@/src/features/branch-ops/types";
import { courseTitle } from "@/src/features/branch-ops/utils/batch-display";
import type { BatchMode } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { getTimingsForMode } from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  formatBatchDaysLabel,
  formatBatchDuration,
  formatBatchDurationType,
  formatBatchEnrollmentCapacityLabel,
  formatBatchOverviewDate,
  getBatchAggregateStats,
  getBatchModeSummaries,
} from "@/src/features/branch-ops/utils/batch-timing.utils";

import { BatchOverviewMetricCards } from "./batch-overview-metric-cards";
import {
  BatchManageEmptyState,
  BatchManageField,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batch: BatchListItem;
  summary: BatchSummary | null;
  summaryLoading?: boolean;
}

const MODE_ACCENTS: Record<
  BatchMode,
  { card: string; chip: string }
> = {
  OFFLINE: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    chip: "bg-amber-50 text-amber-800 ring-amber-100",
  },
  ONLINE: {
    card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  RECORDED: {
    card: "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    chip: "bg-sky-50 text-sky-700 ring-sky-100",
  },
};

function getModeCapacity(batch: BatchListItem, mode: BatchMode): number {
  return getTimingsForMode(batch, mode).reduce(
    (total, timing) => total + (timing.capacity ?? 0),
    0,
  );
}

export function BatchManageOverviewPanel({
  batch,
  summary,
  summaryLoading = false,
}: Props) {
  const currentBranch = useCurrentBranch();
  const modeSummaries = useMemo(() => getBatchModeSummaries(batch), [batch]);
  const aggregateStats = useMemo(
    () => getBatchAggregateStats(batch),
    [batch],
  );
  const enrollmentLabel = formatBatchEnrollmentCapacityLabel(batch);

  const workingDaysLabel =
    batch.totalWorkingDays != null
      ? `${batch.totalWorkingDays} working day${batch.totalWorkingDays === 1 ? "" : "s"}`
      : "—";

  return (
    <div className="space-y-4">
      <BatchManageSection
        title="Batch Summary"
        description="Aggregated overview across all configured learning modes and timings."
      >
        <BatchOverviewMetricCards
          batch={batch}
          aggregateStats={aggregateStats}
          configuredModesCount={modeSummaries.length}
          trainerCount={summary?.trainerCount}
          isLoading={summaryLoading && !summary}
        />
      </BatchManageSection>

      <BatchManageSection
        title="Learning Mode Breakdown"
        description="Configured modes for this parent batch with timing and enrollment totals."
      >
        {modeSummaries.length === 0 ? (
          <BatchManageEmptyState
            icon={MonitorPlay}
            title="No Learning Modes Configured"
            description="Add batch timings to configure Offline, Online, or Self-Paced modes for this batch."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {modeSummaries.map((row) => {
              const accent = MODE_ACCENTS[row.mode];
              const modeCapacity = getModeCapacity(batch, row.mode);
              const modeEnrollment =
                modeCapacity > 0
                  ? `${row.studentsCount} / ${modeCapacity}`
                  : `${row.studentsCount}`;

              return (
                <div
                  key={row.mode}
                  className={cn(
                    "rounded-xl border p-4 shadow-sm",
                    accent.card,
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <BatchModeBadge mode={row.mode} />
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1",
                        accent.chip,
                      )}
                    >
                      {row.timingsCount} timing
                      {row.timingsCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <BatchManageField
                      label="Enrolled / Capacity"
                      value={modeEnrollment}
                    />
                    <BatchManageField
                      label="Students"
                      value={`${row.studentsCount} student${row.studentsCount === 1 ? "" : "s"}`}
                    />
                  </dl>
                </div>
              );
            })}
          </div>
        )}
      </BatchManageSection>

      <BatchManageSection
        title="Enrollment Summary"
        description="Parent batch totals calculated from all child batch timings."
      >
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BatchManageField
            label="Total Enrolled / Capacity"
            value={enrollmentLabel}
          />
          <BatchManageField
            label="Total Capacity"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalCapacity
            }
          />
          <BatchManageField
            label="Total Enrolled"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalEnrolled
            }
          />
          <BatchManageField
            label="Available Seats"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : aggregateStats.totalAvailableSeats
            }
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Batch Schedule Summary"
        description="Shared schedule information for this parent batch."
      >
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField
            label="Branch"
            value={resolvePortalBranchName(currentBranch, batch.branch)}
          />
          <BatchManageField
            label="Course"
            value={courseTitle(batch.course)}
          />
          <BatchManageField
            label="Start Date"
            value={formatBatchOverviewDate(batch.startDate)}
          />
          <BatchManageField
            label="End Date"
            value={formatBatchOverviewDate(batch.endDate)}
          />
          <BatchManageField
            label="Duration"
            value={formatBatchDuration(batch)}
          />
          <BatchManageField
            label="Duration Type"
            value={formatBatchDurationType(batch)}
          />
          <BatchManageField
            label="Total Working Days"
            value={workingDaysLabel}
          />
          <BatchManageField
            label="Batch Days"
            value={formatBatchDaysLabel(batch.daysOfWeek)}
          />
        </dl>
      </BatchManageSection>
    </div>
  );
}
