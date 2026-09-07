"use client";

import { cn } from "@/src/shared/lib/cn";
import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import { getBatchModeLabel, getTimingsForMode } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatEnrollmentOverviewDate,
  formatEnrollmentTimingSchedule,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
  isTimingSelectable,
} from "@/src/features/enrollments/utils/create-enrollment-selection.utils";

interface Props {
  batch: Batch;
  mode: BatchMode;
  selectedTimingId: string;
  reservedTimingId?: string;
  onSelectTiming: (timingId: string) => void;
}

export function CreateEnrollmentTimingSelection({
  batch,
  mode,
  selectedTimingId,
  reservedTimingId,
  onSelectTiming,
}: Props) {
  const timings = getTimingsForMode(batch, mode);

  if (timings.length === 0) {
    return (
      <p className="text-sm text-[#647A9B]">
        No batch timings are configured for {getBatchModeLabel(mode)}.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Select Batch Timing</p>
      <p className="text-xs text-slate-500">
        Showing timings for {batch.name} · {getBatchModeLabel(mode)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {timings.map((timing) => {
          const enrolledCount = getTimingEnrolledCount(timing);
          const availableSeats = getTimingAvailableSeats(timing);
          const selectable = isTimingSelectable(timing, reservedTimingId);
          const isSelected = selectedTimingId === timing.id;

          return (
            <button
              key={timing.id}
              type="button"
              disabled={!selectable}
              onClick={() => onSelectTiming(timing.id)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-[#2563EB] bg-blue-50 ring-1 ring-[#2563EB]"
                  : selectable
                    ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70",
              )}
            >
              <p className="text-sm font-semibold text-[#102A56]">{timing.name}</p>
              <p className="mt-1 text-xs text-slate-600">
                {formatEnrollmentTimingSchedule(timing)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatEnrollmentOverviewDate(timing.startDate)} –{" "}
                {formatEnrollmentOverviewDate(timing.endDate)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Capacity</p>
                  <p className="font-medium text-[#102A56]">{timing.capacity}</p>
                </div>
                <div>
                  <p className="text-slate-500">Enrolled</p>
                  <p className="font-medium text-[#102A56]">{enrolledCount}</p>
                </div>
                <div>
                  <p className="text-slate-500">Available</p>
                  <p className="font-medium text-[#102A56]">{availableSeats}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
