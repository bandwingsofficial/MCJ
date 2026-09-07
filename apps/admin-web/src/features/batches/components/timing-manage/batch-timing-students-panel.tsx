"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";
import {
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  timing: BatchTiming;
}

/** Students are assigned per batch timing. Assignment lands in a later change. */
export function BatchTimingStudentsPanel({ timing }: Props) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <BatchManageSection
      title="Students"
      description={`${enrolledCount} enrolled · ${availableSeats} seats available · ${timing.capacity} capacity`}
    >
      <EmptyState title="No students assigned to this batch timing yet." />
    </BatchManageSection>
  );
}
