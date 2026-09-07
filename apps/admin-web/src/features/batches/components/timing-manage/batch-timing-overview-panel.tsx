"use client";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";
import type {
  Batch,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";
import {
  formatTimingDays,
  formatTimingRange,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  batch: Batch;
  timing: BatchTiming;
}

export function BatchTimingOverviewPanel({ batch, timing }: Props) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <div className="space-y-4">
      <BatchManageSection title="Batch Timing Overview">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Batch Timing" value={timing.name} />
          <BatchManageField
            label="Mode"
            value={<BatchModeBadge mode={timing.mode} />}
          />
          <BatchManageField
            label="Days"
            value={formatTimingDays(timing.daysOfWeek)}
          />
          <BatchManageField
            label="Timing"
            value={formatTimingRange(timing)}
          />
          <BatchManageField
            label="Start Date"
            value={formatBatchOverviewDate(timing.startDate)}
          />
          <BatchManageField
            label="End Date"
            value={formatBatchOverviewDate(timing.endDate)}
          />
          <BatchManageField
            label="Capacity"
            value={String(timing.capacity)}
          />
          <BatchManageField
            label="Enrolled"
            value={`${enrolledCount} Student${enrolledCount === 1 ? "" : "s"}`}
          />
          <BatchManageField
            label="Available Seats"
            value={String(availableSeats)}
          />
          <BatchManageField
            label="Status"
            value={
              <BatchStatusBadge
                status={timing.status}
                isActive={timing.isActive}
                isDeleted={timing.isDeleted}
                startDate={timing.startDate}
                endDate={timing.endDate}
              />
            }
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Parent Batch"
        description="Course and batch this timing belongs to."
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField
            label="Course"
            value={batch.course?.title?.trim() || "No course assigned"}
          />
          <BatchManageField label="Batch Name" value={batch.name} />
          <BatchManageField label="Batch Number" value={batch.code} />
        </dl>
      </BatchManageSection>
    </div>
  );
}
