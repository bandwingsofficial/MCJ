"use client";

import {
  CalendarDays,
  Monitor,
  PlayCircle,
  Video,
} from "lucide-react";

import type { BatchMode } from "@/src/features/batches/types/batch.types";
import type { CourseModeGroupedBatchBlock } from "@/src/features/courses/utils/course-batch.utils";
import { cn } from "@/src/shared/lib/cn";

const MODE_BADGE_STYLES: Record<BatchMode, string> = {
  OFFLINE: "border-orange-100 bg-orange-50 text-orange-700",
  ONLINE: "border-blue-100 bg-blue-50 text-blue-700",
  RECORDED: "border-purple-100 bg-purple-50 text-purple-700",
};

function ModeBadge({ mode, label }: { mode: BatchMode; label: string }) {
  const Icon =
    mode === "OFFLINE" ? Monitor : mode === "ONLINE" ? Video : PlayCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        MODE_BADGE_STYLES[mode],
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

interface CourseBatchTimingsModeTableProps {
  blocks: CourseModeGroupedBatchBlock[];
}

export function CourseBatchTimingsModeTable({
  blocks,
}: CourseBatchTimingsModeTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-[#F4F8FC] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <th className="px-4 py-3.5">Batch Name + Start Date</th>
              <th className="px-4 py-3.5">Mode + Days</th>
              <th className="px-4 py-3.5">Batch / Timing</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, blockIndex) =>
              block.modeRows.map((modeRow, modeIndex) => {
                const isFirstModeRow = modeIndex === 0;
                const isLastModeRow = modeIndex === block.modeRows.length - 1;

                return (
                  <tr
                    key={`${block.batchId}-${modeRow.mode}`}
                    className={cn(
                      "align-top",
                      !isLastModeRow && "border-b border-slate-100",
                      isLastModeRow &&
                        blockIndex < blocks.length - 1 &&
                        "border-b-2 border-slate-200",
                    )}
                  >
                    {isFirstModeRow ? (
                      <td
                        rowSpan={block.modeRows.length}
                        className="border-r border-slate-100 px-4 py-4 align-middle"
                      >
                        <p className="font-semibold leading-6 text-[#0B1F3A]">
                          {block.batchHeadline}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          Start: {block.startDateLabel}
                        </p>
                      </td>
                    ) : null}

                    <td className="px-4 py-4">
                      <ModeBadge
                        mode={modeRow.mode}
                        label={modeRow.modeBadgeLabel}
                      />
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {modeRow.daysLabel}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-3">
                        {modeRow.timings.map((timing) => (
                          <div key={timing.id} className="min-w-0">
                            <p className="font-semibold text-[#0B1F3A]">
                              {timing.name}
                            </p>
                            {timing.scheduleLabel ? (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {timing.scheduleLabel}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
