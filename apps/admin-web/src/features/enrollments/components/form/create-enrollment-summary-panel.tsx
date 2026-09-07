"use client";

import type { Batch, BatchMode, BatchTiming } from "@/src/features/batches/types/batch.types";
import { getBatchModeLabel } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatBatchDuration,
} from "@/src/features/batches/utils/batch-duration.utils";
import {
  formatEnrollmentOverviewDate,
  formatEnrollmentTimingSchedule,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/enrollments/utils/create-enrollment-selection.utils";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

interface Props {
  batch: Batch;
  mode: BatchMode;
  timing: BatchTiming;
  courseTitle: string;
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </p>
    </div>
  );
}

export function CreateEnrollmentSummaryPanel({
  batch,
  mode,
  timing,
  courseTitle,
  feeAmount,
  discountAmount,
  finalAmount,
}: Props) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <h3 className="text-sm font-semibold text-[#102A56]">Enrollment Summary</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Review the selected batch, mode, and timing before assigning a student.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryField label="Batch Name" value={batch.name} />
        <SummaryField label="Batch Number" value={batch.code ?? "—"} />
        <SummaryField label="Course" value={courseTitle || "—"} />
        <SummaryField label="Selected Mode" value={getBatchModeLabel(mode)} />
        <SummaryField label="Selected Batch Timing" value={timing.name} />
        <SummaryField
          label="Timing / Schedule"
          value={formatEnrollmentTimingSchedule(timing)}
        />
        <SummaryField
          label="Start Date"
          value={formatEnrollmentOverviewDate(timing.startDate)}
        />
        <SummaryField
          label="End Date"
          value={formatEnrollmentOverviewDate(timing.endDate)}
        />
        <SummaryField label="Duration" value={formatBatchDuration(batch)} />
        <SummaryField
          label="Applicable Pricing"
          value={formatCurrency(feeAmount)}
        />
        <SummaryField label="Discount" value={formatCurrency(discountAmount)} />
        <SummaryField label="Final Amount" value={formatCurrency(finalAmount)} />
        <SummaryField label="Capacity" value={String(timing.capacity)} />
        <SummaryField label="Enrolled Count" value={String(enrolledCount)} />
        <SummaryField label="Available Seats" value={String(availableSeats)} />
      </div>
    </div>
  );
}
