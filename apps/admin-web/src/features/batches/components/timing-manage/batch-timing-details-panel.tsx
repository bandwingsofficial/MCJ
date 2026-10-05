"use client";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchTemplateStatusBadge } from "@/src/features/batch-templates/components/batch-template-status-badge";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";
import type { Batch, BatchTiming } from "@/src/features/batches/types/batch.types";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";
import {
  formatTimingDays,
  formatTimingRange,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";
import { formatBatchTime } from "@/src/features/batches/utils/batch.helper";

interface Props {
  batch: Batch;
  timing: BatchTiming;
}

export function BatchTimingDetailsPanel({ batch, timing }: Props) {
  return (
    <BatchManageSection
      title="Batch Timing"
      description="Schedule details for this timing."
    >
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BatchManageField label="Batch Timing Name" value={timing.name} />
        <BatchManageField
          label="Mode"
          value={<BatchModeBadge mode={timing.mode} />}
        />
        <BatchManageField
          label="Batch Days"
          value={formatTimingDays(timing.daysOfWeek)}
        />
        <BatchManageField label="Timing" value={formatTimingRange(timing)} />
        <BatchManageField
          label="Start Date"
          value={formatBatchOverviewDate(timing.startDate)}
        />
        <BatchManageField
          label="End Date"
          value={formatBatchOverviewDate(timing.endDate)}
        />
        <BatchManageField
          label="Start Time"
          value={formatBatchTime(timing.startTime)}
        />
        <BatchManageField
          label="End Time"
          value={formatBatchTime(timing.endTime)}
        />
        <BatchManageField label="Capacity" value={String(timing.capacity)} />
        <BatchManageField
          label="Enrolled"
          value={String(getTimingEnrolledCount(timing))}
        />
        <BatchManageField
          label="Available Seats"
          value={String(getTimingAvailableSeats(timing))}
        />
        <BatchManageField
          label="Status"
          value={
            <BatchTemplateStatusBadge
              isActive={timing.isActive}
              isDeleted={timing.isDeleted}
            />
          }
        />
      </dl>
    </BatchManageSection>
  );
}
