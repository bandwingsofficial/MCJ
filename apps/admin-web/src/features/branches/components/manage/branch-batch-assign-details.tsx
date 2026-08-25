"use client";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { formatTrainerNames } from "@/src/features/branches/utils/branch-display.utils";
import {
  calculateBatchProgress,
  formatBatchDaysLabel,
  formatBatchDurationLabel,
  formatBatchLifecycleStatus,
  formatBatchOverviewTiming,
  formatProgressDayLabel,
} from "@/src/features/batches/utils/batch-progress.utils";

interface Props {
  batch: Batch;
  courseTitles?: string[];
  categoryName?: string;
  isLoading?: boolean;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function BranchBatchAssignDetails({
  batch,
  courseTitles,
  categoryName,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Loading batch information...</p>
      </div>
    );
  }

  const progress = calculateBatchProgress(batch);
  const enrolledCount = batch.enrolledCount ?? 0;
  const capacity = batch.capacity ?? 0;
  const availableSeats = Math.max(0, capacity - enrolledCount);
  const courses =
    courseTitles?.filter(Boolean) ??
    (batch.course?.title ? [batch.course.title] : []);
  const courseLabel =
    courses.length > 0 ? courses.join(", ") : "No course assigned";
  const trainerLabel = batch.trainers?.length
    ? formatTrainerNames(batch.trainers)
    : "—";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{batch.name}</h3>
        <span className="font-mono text-xs text-slate-500">{batch.code}</span>
        <BatchStatusBadge status={batch.status} />
        <BatchModeBadge mode={batch.mode} />
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {formatBatchLifecycleStatus(progress)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailRow label="Date Range" value={progress.calendarDurationLabel} />
        <DetailRow
          label="Daily Timing"
          value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
        />
        <DetailRow
          label="Batch Days"
          value={formatBatchDaysLabel(batch.daysOfWeek)}
        />
        <DetailRow
          label="Working Days"
          value={formatProgressDayLabel(progress.totalWorkingDays, "day")}
        />
        <DetailRow label="Capacity" value={String(capacity)} />
        <DetailRow label="Enrolled" value={String(enrolledCount)} />
        <DetailRow label="Available Seats" value={String(availableSeats)} />
        <DetailRow label="Course(s)" value={courseLabel} />
        <DetailRow label="Category" value={categoryName ?? "—"} />
        <DetailRow label="Trainer(s)" value={trainerLabel} />
        <DetailRow
          label="Total Duration"
          value={formatBatchDurationLabel(batch)}
        />
        <DetailRow
          label="Days Remaining"
          value={
            progress.isExpired
              ? "Expired"
              : formatProgressDayLabel(progress.daysRemaining, "day")
          }
        />
      </div>
    </div>
  );
}
