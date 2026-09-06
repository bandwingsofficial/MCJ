"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { BatchManageSection } from "./batch-manage-section";

/** Structure only — attendance records land once students can be assigned. */
export function BatchManageAttendancePanel() {
  return (
    <BatchManageSection title="Attendance">
      <EmptyState
        title="No attendance records yet."
        description="Attendance becomes available once students are assigned to this batch."
      />
    </BatchManageSection>
  );
}
