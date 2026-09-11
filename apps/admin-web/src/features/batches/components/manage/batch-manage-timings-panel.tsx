"use client";

import { useRouter } from "next/navigation";
import { Clock3, Settings2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch, BatchStatus } from "@/src/features/batches/types/batch.types";
import { batchTimingManagePath } from "@/src/features/batches/utils/batch-manage.routes";
import {
  getBatchModeLabel,
  getTimingsForMode,
} from "@/src/features/batches/utils/batch-mode.utils";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";
import {
  formatTimingDays,
  formatTimingRange,
  getBatchModeSummaries,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";

import {
  BatchManageEmptyState,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batch: Batch;
}

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-[#2563EB] transition-colors hover:bg-blue-50 hover:text-[#1E3A8A]";

const TABLE_HEAD_CLASS =
  "px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#526581]";

export function BatchManageTimingsPanel({ batch }: Props) {
  const router = useRouter();
  const modeSummaries = getBatchModeSummaries(batch);

  if (modeSummaries.length === 0) {
    return (
      <BatchManageSection
        title="Batch Timings"
        description="All assigned batch timings grouped by learning mode."
      >
        <BatchManageEmptyState
          icon={Clock3}
          title="No Batch Timings Found"
          description="Assign batch timings to this parent batch to manage schedules and enrollments."
        />
      </BatchManageSection>
    );
  }

  return (
    <div className="space-y-4">
      {modeSummaries.map((modeRow) => {
        const timings = getTimingsForMode(batch, modeRow.mode);

        return (
          <BatchManageSection
            key={modeRow.mode}
            title={modeRow.label}
            description={`${modeRow.timingsCount} timing${modeRow.timingsCount === 1 ? "" : "s"} · ${modeRow.studentsCount} student${modeRow.studentsCount === 1 ? "" : "s"}`}
          >
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[48rem] table-fixed border-collapse">
                <colgroup>
                  <col className="w-[20%]" />
                  <col />
                  <col className="w-[6rem]" />
                  <col className="w-[6rem]" />
                  <col className="w-[6rem]" />
                  <col className="w-[7rem]" />
                  <col className="w-[5rem]" />
                </colgroup>

                <thead className="border-b border-[#D9E4F2] bg-[#F6F9FD]">
                  <tr>
                    <th className={TABLE_HEAD_CLASS}>Batch Timing</th>
                    <th className={TABLE_HEAD_CLASS}>Schedule</th>
                    <th className={TABLE_HEAD_CLASS}>Capacity</th>
                    <th className={TABLE_HEAD_CLASS}>Enrolled</th>
                    <th className={TABLE_HEAD_CLASS}>Available</th>
                    <th className={TABLE_HEAD_CLASS}>Status</th>
                    <th className="px-1.5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#526581]">
                      Manage
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {timings.map((timing) => (
                    <tr
                      key={timing.id}
                      className="border-b border-slate-100 bg-white transition-colors hover:bg-[#F8FBFF]"
                    >
                      <td className="min-w-0 truncate px-3 py-3 align-middle text-sm font-medium text-[#102A56]">
                        {timing.name}
                      </td>
                      <td className="min-w-0 overflow-hidden px-3 py-3 align-middle text-sm text-slate-700">
                        <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                          <span className="truncate">
                            {formatTimingDays(timing.daysOfWeek)} ·{" "}
                            {formatTimingRange(timing)}
                          </span>
                          <span className="truncate text-xs text-[#647A9B]">
                            {formatBatchOverviewDate(timing.startDate)} –{" "}
                            {formatBatchOverviewDate(timing.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle text-sm tabular-nums text-slate-700">
                        {timing.capacity}
                      </td>
                      <td className="px-3 py-3 align-middle text-sm tabular-nums text-slate-700">
                        {getTimingEnrolledCount(timing)}
                      </td>
                      <td className="px-3 py-3 align-middle text-sm tabular-nums text-slate-700">
                        {getTimingAvailableSeats(timing)}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <BatchStatusBadge
                          status={timing.status as BatchStatus}
                          isActive={timing.isActive}
                        />
                      </td>
                      <td className="px-1.5 py-3 align-middle">
                        <div className="flex items-center justify-center">
                          <Tooltip
                            content={`Manage ${getBatchModeLabel(modeRow.mode)} · ${timing.name}`}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  batchTimingManagePath(batch.id, timing.id),
                                )
                              }
                              aria-label={`Manage ${timing.name}`}
                              className={iconButtonClass}
                            >
                              <Settings2 className="h-[1.25rem] w-[1.25rem]" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BatchManageSection>
        );
      })}
    </div>
  );
}
