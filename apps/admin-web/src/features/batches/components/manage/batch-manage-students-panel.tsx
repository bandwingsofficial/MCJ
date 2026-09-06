"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import type { Batch } from "@/src/features/batches/types/batch.types";

import { BatchManageSection } from "./batch-manage-section";

interface Props {
  batch: Batch;
}

/**
 * Students are keyed off the parent `batch.id` so the assignment flow can be
 * built on this relationship later. No assignment UI yet by design.
 */
export function BatchManageStudentsPanel({ batch }: Props) {
  const count = batch.enrolledCount ?? 0;

  return (
    <BatchManageSection
      title="Students"
      description={`${count} Student${count === 1 ? "" : "s"}`}
    >
      <EmptyState
        title="No students assigned to this batch."
        description="Student assignment for this batch will be available soon."
      />
    </BatchManageSection>
  );
}
