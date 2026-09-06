"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";

interface Props {
  timing: BatchTiming;
}

/** Attendance is scoped to this batch timing. Records land once students exist. */
export function BatchTimingAttendancePanel({ timing }: Props) {
  return (
    <BatchManageSection title="Attendance" description={timing.name}>
      <EmptyState
        title="No attendance records yet."
        description="Attendance for this batch timing will appear here once students are assigned."
      />
    </BatchManageSection>
  );
}
