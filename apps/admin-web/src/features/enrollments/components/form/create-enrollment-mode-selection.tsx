"use client";

import { cn } from "@/src/shared/lib/cn";
import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import { getConfiguredModeSummaries } from "@/src/features/batches/utils/batch-mode.utils";

interface Props {
  batch: Batch;
  selectedMode: BatchMode | "";
  onSelectMode: (mode: BatchMode) => void;
}

export function CreateEnrollmentModeSelection({
  batch,
  selectedMode,
  onSelectMode,
}: Props) {
  const modes = getConfiguredModeSummaries(batch);

  if (modes.length === 0) {
    return (
      <p className="text-sm text-[#647A9B]">
        No delivery modes are configured for this batch.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Select Mode</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {modes.map((modeSummary) => {
          const isSelected = selectedMode === modeSummary.mode;

          return (
            <button
              key={modeSummary.mode}
              type="button"
              onClick={() => onSelectMode(modeSummary.mode)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-[#2563EB] bg-blue-50 ring-1 ring-[#2563EB]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <p className="text-sm font-semibold text-[#102A56]">
                {modeSummary.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {modeSummary.timingsCount} timing
                {modeSummary.timingsCount === 1 ? "" : "s"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
