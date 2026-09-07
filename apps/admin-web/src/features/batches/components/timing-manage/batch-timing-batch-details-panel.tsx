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
import {
  formatBatchDuration,
  formatBatchDurationType,
} from "@/src/features/batches/utils/batch-duration.utils";
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

/** Selected timing + parent batch fields scoped to this child timing. */
export function BatchTimingBatchDetailsPanel({ batch, timing }: Props) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <BatchManageSection
      title="Batch Details"
      description="Parent batch and selected batch timing information."
    >
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BatchManageField label="Batch Name" value={batch.name} />
        <BatchManageField label="Batch Number" value={batch.code} />
        <BatchManageField
          label="Course"
          value={batch.course?.title?.trim() || "No course assigned"}
        />
        <BatchManageField
          label="Learning Mode"
          value={<BatchModeBadge mode={timing.mode} />}
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
          label="Start Date"
          value={formatBatchOverviewDate(timing.startDate)}
        />
        <BatchManageField
          label="End Date"
          value={formatBatchOverviewDate(timing.endDate)}
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
        <BatchManageField label="Timing" value={formatTimingRange(timing)} />
        <BatchManageField
          label="Batch Days"
          value={formatTimingDays(timing.daysOfWeek)}
        />
        <BatchManageField label="Capacity" value={String(timing.capacity)} />
        <BatchManageField label="Enrolled" value={String(enrolledCount)} />
        <BatchManageField
          label="Available Seats"
          value={String(availableSeats)}
        />
      </dl>
    </BatchManageSection>
  );
}
