"use client";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { BatchMode, BatchStatus, DayOfWeek } from "@/src/features/batches/types/batch.types";
import { formatBatchDaysLabel } from "@/src/features/batches/utils/batch-progress.utils";
import { isBatchMode } from "@/src/features/batches/utils/batch-mode.utils";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  formatEnrollmentOverviewBatchNumber,
  formatEnrollmentOverviewCategoryName,
  formatEnrollmentOverviewCourseTitle,
  formatEnrollmentOverviewDuration,
  formatEnrollmentOverviewEndDate,
  formatEnrollmentOverviewSelectedBatchTiming,
  formatEnrollmentOverviewSelectedMode,
  formatEnrollmentOverviewStartDate,
  formatEnrollmentOverviewTrainerNames,
  getEnrollmentTimingAvailableSeats,
  getEnrollmentTimingEnrolledCount,
} from "@/src/features/enrollments/utils/enrollment-overview.utils";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageBatchDetails({ enrollment }: Props) {
  const timing = enrollment.batchTiming;
  const parentBatch = enrollment.batch;
  const mode = timing?.mode;
  const resolvedMode =
    mode && isBatchMode(mode) ? (mode as BatchMode) : null;

  if (!timing) {
    return (
      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
        <p className="text-sm font-medium text-amber-900">
          Selected batch timing is not linked to this enrollment.
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Batch timing data is missing from the saved enrollment record
          {enrollment.batchTimingId
            ? ` (timing ID: ${enrollment.batchTimingId})`
            : ""}
          .
        </p>
      </div>
    );
  }

  const enrolledCount = getEnrollmentTimingEnrolledCount(timing);
  const availableSeats = getEnrollmentTimingAvailableSeats(timing);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-[#102A56]">
            {parentBatch?.name ?? "Parent Batch"}
          </h3>
          {parentBatch?.code ? (
            <span className="font-mono text-xs text-slate-500">
              {parentBatch.code}
            </span>
          ) : null}
          {parentBatch?.status ? (
            <BatchStatusBadge
              status={parentBatch.status as BatchStatus}
              isActive={parentBatch.isActive}
            />
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <EnrollmentDetailItem
            label="Course"
            value={formatEnrollmentOverviewCourseTitle(enrollment)}
          />
          <EnrollmentDetailItem
            label="Category"
            value={formatEnrollmentOverviewCategoryName(enrollment)}
          />
          <EnrollmentDetailItem
            label="Trainer"
            value={formatEnrollmentOverviewTrainerNames(enrollment)}
          />
          <EnrollmentDetailItem
            label="Duration"
            value={formatEnrollmentOverviewDuration(enrollment)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-[#102A56]">
            {timing.name}
          </h3>
          {resolvedMode ? <BatchModeBadge mode={resolvedMode} /> : null}
          <BatchStatusBadge
            status={timing.status as BatchStatus}
            isActive={timing.isActive}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <EnrollmentDetailItem
            label="Selected Mode"
            value={formatEnrollmentOverviewSelectedMode(enrollment)}
          />
          <EnrollmentDetailItem
            label="Selected Batch Timing"
            value={formatEnrollmentOverviewSelectedBatchTiming(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch Start Date"
            value={formatEnrollmentOverviewStartDate(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch End Date"
            value={formatEnrollmentOverviewEndDate(enrollment)}
          />
          <EnrollmentDetailItem
            label="Batch Days"
            value={formatBatchDaysLabel(timing.daysOfWeek as DayOfWeek[])}
          />
          <EnrollmentDetailItem
            label="Batch Number"
            value={formatEnrollmentOverviewBatchNumber(enrollment)}
          />
          <EnrollmentDetailItem
            label="Capacity"
            value={String(timing.capacity)}
          />
          <EnrollmentDetailItem
            label="Enrolled Count"
            value={String(enrolledCount)}
          />
          <EnrollmentDetailItem
            label="Available Seats"
            value={String(availableSeats)}
          />
        </div>
      </div>
    </div>
  );
}
