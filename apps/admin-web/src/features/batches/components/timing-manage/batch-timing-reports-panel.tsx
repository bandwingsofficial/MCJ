"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";

interface Props {
  timing: BatchTiming;
}

/** Reports are scoped to this batch timing. */
export function BatchTimingReportsPanel({ timing }: Props) {
  return (
    <BatchManageSection title="Reports" description={timing.name}>
      <EmptyState
        title="No reports available yet."
        description="Reports for this batch timing will appear here once student and attendance data exist."
      />
    </BatchManageSection>
  );
}
