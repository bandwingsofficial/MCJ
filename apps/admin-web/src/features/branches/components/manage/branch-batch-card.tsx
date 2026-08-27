"use client";

import { Eye, Link2Off } from "lucide-react";

import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { COURSE_TRAINER_UNASSIGNED_LABEL } from "@/src/features/batches/utils/batch-course.utils";
import { formatTrainerNames } from "@/src/features/branches/utils/branch-display.utils";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
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
  categoryLabel?: string;
  trainerLabel?: string;
  assignmentsDisabled?: boolean;
  onUnassign?: () => void;
  compact?: boolean;
}

function BatchDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function BranchBatchCard({
  batch,
  courseTitles,
  categoryLabel,
  trainerLabel,
  assignmentsDisabled = false,
  onUnassign,
  compact = false,
}: Props) {
  const progress = calculateBatchProgress(batch);
  const enrolledCount = batch.enrolledCount ?? 0;
  const capacity = batch.capacity ?? 0;
  const availableSeats = Math.max(0, capacity - enrolledCount);
  const courses =
    courseTitles?.filter(Boolean) ??
    (batch.course?.title ? [batch.course.title] : []);
  const courseLabel =
    courses.length > 0 ? courses.join(", ") : "No course assigned";
  const resolvedCategory =
    categoryLabel?.trim() || batch.category?.name?.trim() || "";
  const resolvedTrainer =
    trainerLabel?.trim() ||
    (batch.trainers?.length ? formatTrainerNames(batch.trainers) : "") ||
    COURSE_TRAINER_UNASSIGNED_LABEL;

  return (
    <article
      className={
        compact
          ? "rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          : "rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#102A56]">
            {batch.name}
          </h3>
          <p className="mt-0.5 font-mono text-sm text-[#647A9B]">
            {batch.code}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <BranchIconAction
            icon={Eye}
            label="View batch"
            href={`/batches/${batch.id}/manage`}
          />
          {onUnassign ? (
            <BranchIconAction
              icon={Link2Off}
              label="Unassign batch"
              destructive
              disabled={assignmentsDisabled}
              onClick={onUnassign}
            />
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        {progress.calendarDurationLabel}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {formatBatchDaysLabel(batch.daysOfWeek)}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {formatBatchOverviewTiming(batch.startTime, batch.endTime)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <BatchStatusBadge status={batch.status} />
        <BatchModeBadge mode={batch.mode} />
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {formatBatchLifecycleStatus(progress)}
        </span>
      </div>

      <div
        className={
          compact
            ? "mt-4 grid grid-cols-2 gap-3"
            : "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
        }
      >
        <BatchDetailRow label="Course" value={courseLabel} />
        {!compact && resolvedCategory ? (
          <BatchDetailRow label="Category" value={resolvedCategory} />
        ) : null}
        {!compact ? (
          <BatchDetailRow label="Trainer" value={resolvedTrainer} />
        ) : null}
        <BatchDetailRow
          label="Students"
          value={`${enrolledCount} / ${capacity}`}
        />
        <BatchDetailRow
          label="Available Seats"
          value={String(availableSeats)}
        />
        {!compact ? (
          <>
            <BatchDetailRow
              label="Total Duration"
              value={formatBatchDurationLabel(batch)}
            />
            <BatchDetailRow
              label="Days Remaining"
              value={
                progress.isExpired
                  ? "Expired"
                  : formatProgressDayLabel(progress.daysRemaining, "day")
              }
            />
          </>
        ) : null}
      </div>
    </article>
  );
}
