"use client";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";
import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  formatBatchDuration,
  formatBatchDurationType,
} from "@/src/features/batches/utils/batch-duration.utils";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";

interface Props {
  batch: Batch;
}

/** Parent batch details shown in the context of this child timing. */
export function BatchTimingBatchDetailsPanel({ batch }: Props) {
  return (
    <BatchManageSection
      title="Batch Details"
      description="Parent batch information for this timing."
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
          value={<BatchModeBadge mode={batch.mode} />}
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
          value={formatBatchOverviewDate(batch.startDate)}
        />
        <BatchManageField
          label="End Date"
          value={formatBatchOverviewDate(batch.endDate)}
        />
        <BatchManageField
          label="Status"
          value={
            <BatchStatusBadge
              status={batch.status}
              isActive={batch.isActive}
              isDeleted={Boolean(batch.deletedAt || batch.isDeleted)}
              startDate={batch.startDate}
              endDate={batch.endDate}
            />
          }
        />
      </dl>
    </BatchManageSection>
  );
}
