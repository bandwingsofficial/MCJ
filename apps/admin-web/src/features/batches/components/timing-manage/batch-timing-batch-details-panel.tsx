"use client";

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
import { formatBatchTime } from "@/src/features/batches/utils/batch.helper";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";
import {
  formatTimingDays,
  formatTimingRange,
} from "@/src/features/batches/utils/batch-timing.utils";

import { BatchTimingCapacityForm } from "./batch-timing-capacity-form";

interface Props {
  batch: Batch;
  timing: BatchTiming;
  onTimingUpdated?: () => void;
}

/** Parent batch + schedule for this timing (no duplicate enrollment summary). */
export function BatchTimingBatchDetailsPanel({
  batch,
  timing,
  onTimingUpdated,
}: Props) {
  return (
    <div className="space-y-4">
      <BatchManageSection
        title="Parent Batch"
        description="Batch this timing belongs to."
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Batch Name" value={batch.name} />
          <BatchManageField label="Batch Number" value={batch.code} />
          <BatchManageField
            label="Course"
            value={batch.course?.title?.trim() || "No course assigned"}
          />
          <BatchManageField
            label="Duration"
            value={formatBatchDuration(batch)}
          />
          <BatchManageField
            label="Duration Type"
            value={formatBatchDurationType(batch)}
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Schedule"
        description="Dates and times for this batch timing."
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField
            label="Batch Days"
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
            label="Daily Timing"
            value={formatTimingRange(timing)}
          />
          <BatchManageField
            label="Start Time"
            value={formatBatchTime(timing.startTime)}
          />
          <BatchManageField
            label="End Time"
            value={formatBatchTime(timing.endTime)}
          />
        </dl>
      </BatchManageSection>

      <BatchTimingCapacityForm
        batchId={batch.id}
        timing={timing}
        onUpdated={() => onTimingUpdated?.()}
      />
    </div>
  );
}
