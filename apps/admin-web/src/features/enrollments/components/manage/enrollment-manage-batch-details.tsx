"use client";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { BatchMode, BatchStatus, DayOfWeek } from "@/src/features/batches/types/batch.types";
import { formatBatchDaysLabel } from "@/src/features/batches/utils/batch-progress.utils";
import { isBatchMode } from "@/src/features/batches/utils/batch-mode.utils";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  formatEnrollmentOverviewBatchName,
  formatEnrollmentOverviewBatchNumber,
  formatEnrollmentOverviewEndDate,
  formatEnrollmentOverviewSelectedBatchTiming,
  formatEnrollmentOverviewSelectedMode,
  formatEnrollmentOverviewStartDate,
  getEnrollmentTimingAvailableSeats,
  getEnrollmentTimingEnrolledCount,
} from "@/src/features/enrollments/utils/enrollment-overview.utils";

interface Props {
  enrollment: Enrollment;
}

function MissingTimingNotice({ enrollment }: { enrollment: Enrollment }) {
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

export function EnrollmentManageBatchDetails({ enrollment }: Props) {
  const timing = enrollment.batchTiming;
  const parentBatch = enrollment.batch;
  const mode = timing?.mode;
  const resolvedMode =
    mode && isBatchMode(mode) ? (mode as BatchMode) : null;

  if (!parentBatch && !timing) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
        <h3 className="text-base font-semibold text-[#102A56]">
          Batch not available
        </h3>
        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
          No batch is linked to this enrollment.
        </p>
      </div>
    );
  }

  const enrolledCount = timing ? getEnrollmentTimingEnrolledCount(timing) : null;
  const availableSeats = timing ? getEnrollmentTimingAvailableSeats(timing) : null;

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Batch
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Enrolled batch details for {enrollment.enrollmentNumber}
        </p>
      </div>

      {parentBatch ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
          <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[#102A56]">
                {parentBatch.name}
              </h3>
              {parentBatch.code ? (
                <span className="font-mono text-xs text-[#647A9B]">
                  {parentBatch.code}
                </span>
              ) : null}
              {parentBatch.status ? (
                <BatchStatusBadge
                  status={parentBatch.status as BatchStatus}
                  isActive={parentBatch.isActive}
                />
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Parent batch linked to this enrollment.
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <EnrollmentDetailItem
              label="Batch Name"
              value={formatEnrollmentOverviewBatchName(enrollment)}
            />
            <EnrollmentDetailItem
              label="Batch Number"
              value={formatEnrollmentOverviewBatchNumber(enrollment)}
            />
            <EnrollmentDetailItem
              label="Batch ID"
              value={parentBatch.id}
            />
          </div>
        </div>
      ) : null}

      {timing ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
          <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[#102A56]">
                {timing.name}
              </h3>
              {resolvedMode ? <BatchModeBadge mode={resolvedMode} /> : null}
              <BatchStatusBadge
                status={timing.status as BatchStatus}
                isActive={timing.isActive}
              />
            </div>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Selected learning mode and timing for this enrollment.
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <EnrollmentDetailItem
              label="Selected Mode"
              value={formatEnrollmentOverviewSelectedMode(enrollment)}
            />
            <EnrollmentDetailItem
              label="Selected Batch Timing"
              value={formatEnrollmentOverviewSelectedBatchTiming(enrollment)}
            />
            <EnrollmentDetailItem
              label="Timing ID"
              value={timing.id}
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
              label="Capacity"
              value={String(timing.capacity)}
            />
            <EnrollmentDetailItem
              label="Enrolled Count"
              value={String(enrolledCount ?? 0)}
            />
            <EnrollmentDetailItem
              label="Available Seats"
              value={String(availableSeats ?? 0)}
            />
          </div>
        </div>
      ) : (
        <MissingTimingNotice enrollment={enrollment} />
      )}
    </div>
  );
}
