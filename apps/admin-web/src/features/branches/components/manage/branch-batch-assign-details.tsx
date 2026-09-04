"use client";

import { useEffect, useState } from "react";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { COURSE_TRAINER_UNASSIGNED_LABEL } from "@/src/features/batches/utils/batch-course.utils";
import {
  formatBatchConfiguredDuration,
  formatBatchDurationTypeLabel,
  loadBranchBatchRelationMeta,
} from "@/src/features/branches/utils/branch-batch-relation.utils";
import { formatCoursePrice } from "@/src/features/branches/utils/branch-display.utils";
import {
  calculateBatchProgress,
  formatBatchDaysLabel,
  formatBatchOverviewDate,
  formatBatchOverviewTiming,
  formatProgressDayLabel,
} from "@/src/features/batches/utils/batch-progress.utils";

interface Props {
  batch: Batch;
  courseTitles?: string[];
  categoryName?: string;
  isLoading?: boolean;
  /** Hide Course(s)/Trainer(s) rows when a dedicated courses grid is shown below. */
  hideCourseAndTrainer?: boolean;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function BranchBatchAssignDetails({
  batch,
  courseTitles,
  categoryName,
  isLoading = false,
  hideCourseAndTrainer = false,
}: Props) {
  const [trainerLabel, setTrainerLabel] = useState(COURSE_TRAINER_UNASSIGNED_LABEL);
  const [relationLoading, setRelationLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setRelationLoading(true);
      try {
        const meta = await loadBranchBatchRelationMeta([batch]);
        if (!cancelled) {
          setTrainerLabel(
            meta[batch.id]?.trainerLabel || COURSE_TRAINER_UNASSIGNED_LABEL,
          );
        }
      } catch {
        if (!cancelled) {
          setTrainerLabel(COURSE_TRAINER_UNASSIGNED_LABEL);
        }
      } finally {
        if (!cancelled) {
          setRelationLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [batch]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-[#647A9B]">Loading batch information...</p>
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
    courses.length > 0
      ? courses.join(", ")
      : batch.course?.title?.trim() || "No course assigned";
  const resolvedCategory =
    categoryName?.trim() ||
    batch.course?.category?.name?.trim() ||
    batch.category?.name?.trim() ||
    "—";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-[#102A56]">{batch.name}</h3>
        <span className="font-mono text-xs text-slate-500">{batch.code}</span>
        <BatchStatusBadge
          status={batch.status}
          isActive={batch.isActive}
          isDeleted={Boolean(batch.isDeleted || batch.deletedAt)}
        />
        <BatchModeBadge mode={batch.mode} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailRow
          label="Start Date"
          value={formatBatchOverviewDate(batch.startDate)}
        />
        <DetailRow
          label="End Date"
          value={formatBatchOverviewDate(batch.endDate)}
        />
        <DetailRow
          label="Daily Timing"
          value={formatBatchOverviewTiming(batch.startTime, batch.endTime)}
        />
        <DetailRow
          label="Batch Days"
          value={formatBatchDaysLabel(batch.daysOfWeek)}
        />
        <DetailRow
          label="Duration"
          value={formatBatchConfiguredDuration(batch)}
        />
        <DetailRow
          label="Duration Type"
          value={formatBatchDurationTypeLabel(batch.durationType)}
        />
        <DetailRow
          label="Working Days"
          value={formatProgressDayLabel(progress.totalWorkingDays, "day")}
        />
        <DetailRow label="Pricing" value={formatCoursePrice(batch)} />
        <DetailRow label="Capacity" value={String(capacity)} />
        <DetailRow label="Enrolled" value={String(enrolledCount)} />
        <DetailRow label="Available Seats" value={String(availableSeats)} />
        {!hideCourseAndTrainer ? (
          <>
            <DetailRow label="Course" value={courseLabel} />
            <DetailRow label="Category" value={resolvedCategory} />
            <DetailRow
              label="Trainer"
              value={relationLoading ? "…" : trainerLabel}
            />
          </>
        ) : (
          <DetailRow label="Category" value={resolvedCategory} />
        )}
      </div>
    </div>
  );
}
