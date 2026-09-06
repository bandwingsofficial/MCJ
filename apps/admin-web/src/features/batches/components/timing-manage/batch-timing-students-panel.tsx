"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";

interface Props {
  timing: BatchTiming;
}

/** Students are assigned per batch timing. Assignment lands in a later change. */
export function BatchTimingStudentsPanel({ timing }: Props) {
  const count = timing.studentsCount ?? 0;

  return (
    <BatchManageSection
      title="Students"
      description={`${count} Student${count === 1 ? "" : "s"}`}
    >
      <EmptyState title="No students assigned to this batch timing yet." />
    </BatchManageSection>
  );
}
