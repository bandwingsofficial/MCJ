"use client";

import { useRouter } from "next/navigation";
import { Settings2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { batchTimingManagePath } from "@/src/features/batches/utils/batch-manage.routes";
import {
  formatTimingDays,
  formatTimingRange,
  getBatchTimings,
} from "@/src/features/batches/utils/batch-timing.utils";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";

import {
  BatchManageEmptyMessage,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batch: Batch;
}

/** Every timing shown here belongs to `batch.id` — the API scopes by batchId. */
export function BatchManageTimingsPanel({ batch }: Props) {
  const router = useRouter();
  const timings = getBatchTimings(batch);

  return (
    <BatchManageSection
      title="Batch Timings"
      description={
        timings.length === 1
          ? "1 timing belongs to this batch."
          : `${timings.length} timings belong to this batch.`
      }
    >
      {timings.length === 0 ? (
        <BatchManageEmptyMessage message="No batch timings are linked to this batch yet." />
      ) : (
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[44rem] table-fixed border-collapse">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[8.5rem]" />
              <col className="w-[20%]" />
              <col />
              <col className="w-[7rem]" />
              <col className="w-[6rem]" />
            </colgroup>

            <thead className="border-b border-slate-200 bg-[#F6F9FD]">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Batch Timing
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mode
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Days
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-1.5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Management
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {timings.map((timing) => (
                <tr
                  key={timing.id}
                  className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                >
                  <td className="min-w-0 truncate px-3 py-3 align-middle text-sm font-medium text-[#102A56]">
                    {timing.name}
                  </td>

                  <td className="min-w-0 overflow-hidden px-2 py-3 align-middle">
                    <BatchModeBadge mode={timing.mode} />
                  </td>

                  <td className="min-w-0 truncate px-3 py-3 align-middle text-sm text-slate-700">
                    {formatTimingDays(timing.daysOfWeek)}
                  </td>

                  <td className="min-w-0 overflow-hidden px-3 py-3 align-middle text-sm text-slate-700">
                    <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                      <span className="truncate">
                        {formatBatchOverviewDate(timing.startDate)} –{" "}
                        {formatBatchOverviewDate(timing.endDate)}
                      </span>
                      <span className="truncate">
                        {formatTimingRange(timing)}
                      </span>
                    </div>
                  </td>

                  <td className="min-w-0 overflow-hidden px-2 py-3 align-middle">
                    <BatchStatusBadge
                      status={timing.status}
                      isActive={timing.isActive}
                      isDeleted={timing.isDeleted}
                      startDate={timing.startDate}
                      endDate={timing.endDate}
                    />
                  </td>

                  <td className="px-1.5 py-3 align-middle">
                    <div className="flex items-center justify-center">
                      <Tooltip content="Manage batch timing">
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
                          className="h-9 w-9 shrink-0 rounded-lg p-0 text-[#2563EB] transition-colors hover:bg-blue-50 hover:text-[#1E3A8A]"
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
      )}
    </BatchManageSection>
  );
}
