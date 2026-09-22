"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  formatBatchDuration,
  formatBatchDurationType,
} from "@/src/features/batches/utils/batch-duration.utils";
import { getBatchModePricing } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatTimingRange,
  getBatchAggregateStats,
  getBatchTimings,
} from "@/src/features/batches/utils/batch-timing.utils";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";

import {
  BatchManageEmptyState,
  BatchManageField,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batch: Batch;
  onEdit: () => void;
  editDisabled?: boolean;
}

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-[#2563EB] transition-colors hover:bg-blue-50 hover:text-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-40";

const TABLE_HEAD_CLASS =
  "px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#526581]";

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTimingLabel(name: string, timingRange: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return timingRange;
  }
  return `${trimmedName} · ${timingRange}`;
}

export function BatchManageDetailsPanel({
  batch,
  onEdit,
  editDisabled = false,
}: Props) {
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);
  const aggregateStats = getBatchAggregateStats(batch);
  const timings = getBatchTimings(batch);

  return (
    <div className="space-y-4">
      <BatchManageSection
        title="Common Batch Details"
        description="Shared parent batch information across all learning modes."
        action={
          <Tooltip content="Edit Batch">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={editDisabled || isArchived}
              onClick={onEdit}
              aria-label="Edit Batch"
              className={iconButtonClass}
            >
              <Pencil className="h-[1.25rem] w-[1.25rem]" />
            </Button>
          </Tooltip>
        }
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Batch Name" value={batch.name} />
          <BatchManageField label="Batch Number" value={batch.code} />
          <BatchManageField
            label="Course"
            value={batch.course?.title?.trim() || "No course assigned"}
          />
          <BatchManageField
            label="Duration"
            value={formatBatchDuration(batch)}
          />
          <BatchManageField
            label="Duration Type"
            value={formatBatchDurationType(batch)}
          />
          <BatchManageField
            label="Start Date"
            value={formatBatchOverviewDate(batch.startDate)}
          />
          <BatchManageField
            label="End Date"
            value={formatBatchOverviewDate(batch.endDate)}
          />
          <BatchManageField
            label="Status"
            value={
              <BatchStatusBadge
                status={batch.status}
                isActive={batch.isActive}
                isDeleted={isArchived}
                startDate={batch.startDate}
                endDate={batch.endDate}
              />
            }
          />
          <BatchManageField
            label="Total Timings"
            value={String(aggregateStats.totalTimings)}
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Batch Timings & Pricing"
        description="Configured batch timings with mode pricing."
      >
        {timings.length === 0 ? (
          <BatchManageEmptyState
            title="No Batch Timings Found"
            description="Assign batch timings to view pricing and status details."
          />
        ) : (
          <div className="w-full min-w-0 max-sm:overflow-x-auto">
            <table className="w-full border-collapse table-fixed max-sm:min-w-[36rem]">
              <colgroup>
                <col style={{ width: "34%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "19%" }} />
              </colgroup>
              <thead className="border-b border-[#D9E4F2] bg-[#F6F9FD]">
                <tr>
                  <th className={TABLE_HEAD_CLASS}>Batch Timings</th>
                  <th className={`${TABLE_HEAD_CLASS} whitespace-nowrap`}>
                    Original Price
                  </th>
                  <th className={`${TABLE_HEAD_CLASS} whitespace-nowrap`}>
                    Discount
                  </th>
                  <th className={`${TABLE_HEAD_CLASS} whitespace-nowrap`}>
                    Final
                  </th>
                  <th className={`${TABLE_HEAD_CLASS} whitespace-nowrap`}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {timings.map((timing) => {
                  const pricing = getBatchModePricing(batch, timing.mode);
                  const timingRange = formatTimingRange(timing);

                  return (
                    <tr
                      key={timing.id}
                      className="border-b border-slate-100 bg-white transition-colors hover:bg-[#F8FBFF]"
                    >
                      <td className="min-w-0 px-3 py-3 align-middle text-sm font-medium text-[#102A56]">
                        <span className="break-words">
                          {formatTimingLabel(timing.name, timingRange)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-sm tabular-nums text-slate-700">
                        {pricing
                          ? pricing.isFree
                            ? "Free"
                            : formatMoney(
                                pricing.originalPrice,
                                pricing.currency,
                              )
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-sm tabular-nums text-slate-700">
                        {pricing
                          ? pricing.isFree
                            ? "—"
                            : formatMoney(
                                pricing.discountAmount,
                                pricing.currency,
                              )
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-sm tabular-nums text-slate-700">
                        {pricing
                          ? pricing.isFree
                            ? "Free"
                            : formatMoney(
                                pricing.discountedPrice,
                                pricing.currency,
                              )
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle">
                        <BatchStatusBadge
                          status={timing.status}
                          isActive={timing.isActive}
                          isDeleted={timing.isDeleted}
                          startDate={timing.startDate}
                          endDate={timing.endDate}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </BatchManageSection>
    </div>
  );
}
