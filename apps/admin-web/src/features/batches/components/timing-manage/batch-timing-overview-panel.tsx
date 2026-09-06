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
} from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  batch: Batch;
  timing: BatchTiming;
}

export function BatchTimingOverviewPanel({ batch, timing }: Props) {
  const studentsCount = timing.studentsCount ?? 0;

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
            label="Students"
            value={`${studentsCount} Student${studentsCount === 1 ? "" : "s"}`}
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
