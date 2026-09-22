"use client";

import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";
import {
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  timing: BatchTiming;
}

export function BatchTimingOverviewPanel({ timing }: Props) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <BatchManageSection
      title="Enrollment Summary"
      description="Seat usage for this batch timing."
    >
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BatchManageField label="Capacity" value={String(timing.capacity)} />
        <BatchManageField
          label="Enrolled"
          value={`${enrolledCount} Student${enrolledCount === 1 ? "" : "s"}`}
        />
        <BatchManageField
          label="Available Seats"
          value={String(availableSeats)}
        />
      </dl>
    </BatchManageSection>
  );
}
