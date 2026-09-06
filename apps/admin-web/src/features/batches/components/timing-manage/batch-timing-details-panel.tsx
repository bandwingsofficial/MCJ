"use client";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";
import { formatTimingDays } from "@/src/features/batches/utils/batch-timing.utils";
import { formatBatchTime } from "@/src/features/batches/utils/batch.helper";

interface Props {
  timing: BatchTiming;
}

export function BatchTimingDetailsPanel({ timing }: Props) {
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
          label="Days"
          value={formatTimingDays(timing.daysOfWeek)}
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
          label="Start Time"
          value={formatBatchTime(timing.startTime)}
        />
        <BatchManageField
          label="End Time"
          value={formatBatchTime(timing.endTime)}
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
  );
}
