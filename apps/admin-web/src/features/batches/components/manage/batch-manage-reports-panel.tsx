"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { BatchManageSection } from "./batch-manage-section";

/** Structure only — reports are filtered by batchId once the data exists. */
export function BatchManageReportsPanel() {
  return (
    <BatchManageSection title="Reports">
      <EmptyState
        title="No reports available yet."
        description="Reports for this batch will appear here once attendance and student data exist."
      />
    </BatchManageSection>
  );
}
