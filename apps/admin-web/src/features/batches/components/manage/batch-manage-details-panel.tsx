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
import {
  getConfiguredModeSummaries,
  getTimingsForMode,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatBatchEnrollmentCapacityLabel,
  formatTimingDays,
  formatTimingRange,
  getBatchAggregateStats,
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

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function BatchManageDetailsPanel({
  batch,
  onEdit,
  editDisabled = false,
}: Props) {
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);
  const modeSummaries = getConfiguredModeSummaries(batch);
  const aggregateStats = getBatchAggregateStats(batch);

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
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <BatchManageField
            label="Total Capacity"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : String(aggregateStats.totalCapacity)
            }
          />
          <BatchManageField
            label="Total Enrolled"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : String(aggregateStats.totalEnrolled)
            }
          />
          <BatchManageField
            label="Available Seats"
            value={
              aggregateStats.totalTimings === 0
                ? "—"
                : String(aggregateStats.totalAvailableSeats)
            }
          />
          <BatchManageField
            label="Enrollment / Capacity"
            value={formatBatchEnrollmentCapacityLabel(batch)}
          />
          {batch.description?.trim() ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <BatchManageField
                label="Description"
                value={batch.description.trim()}
              />
            </div>
          ) : null}
        </dl>
      </BatchManageSection>

      {modeSummaries.length === 0 ? (
        <BatchManageSection
          title="Learning Mode Details"
          description="Mode-specific timings and pricing for this batch."
        >
          <BatchManageEmptyState
            title="No Learning Modes Configured"
            description="Batch timings must be assigned before mode-specific details can be shown."
          />
        </BatchManageSection>
      ) : (
        modeSummaries.map((row) => {
          const timings = getTimingsForMode(batch, row.mode);

          return (
            <BatchManageSection
              key={row.mode}
              title={row.label}
              description={`${row.timingsCount} timing${row.timingsCount === 1 ? "" : "s"} · ${row.studentsCount} student${row.studentsCount === 1 ? "" : "s"}`}
            >
              <div className="space-y-4">
                <dl className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <BatchManageField
                    label="Original Price"
                    value={
                      row.pricing
                        ? formatMoney(
                            row.pricing.originalPrice,
                            row.pricing.currency,
                          )
                        : "—"
                    }
                  />
                  <BatchManageField
                    label="Discount Amount"
                    value={
                      row.pricing
                        ? formatMoney(
                            row.pricing.discountAmount,
                            row.pricing.currency,
                          )
                        : "—"
                    }
                  />
                  <BatchManageField
                    label="Final Amount"
                    value={
                      row.pricing
                        ? row.pricing.isFree
                          ? "Free"
                          : formatMoney(
                              row.pricing.discountedPrice,
                              row.pricing.currency,
                            )
                        : "—"
                    }
                  />
                </dl>

                {timings.length === 0 ? (
                  <BatchManageEmptyState
                    title="No Timings for This Mode"
                    description="No batch timings are configured under this learning mode."
                  />
                ) : (
                  <div className="space-y-3">
                    {timings.map((timing) => (
                      <div
                        key={timing.id}
                        className="rounded-xl border border-[#E1EBF5] bg-[#FAFCFF] p-4"
                      >
                        <h3 className="text-sm font-semibold text-[#102A56]">
                          {timing.name}
                        </h3>
                        <dl className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <BatchManageField
                            label="Start Date"
                            value={formatBatchOverviewDate(timing.startDate)}
                          />
                          <BatchManageField
                            label="End Date"
                            value={formatBatchOverviewDate(timing.endDate)}
                          />
                          <BatchManageField
                            label="Days"
                            value={formatTimingDays(timing.daysOfWeek)}
                          />
                          <BatchManageField
                            label="Start Time / End Time"
                            value={formatTimingRange(timing)}
                          />
                          <BatchManageField
                            label="Status"
                            value={
                              <BatchStatusBadge
                                status={timing.status}
                                isActive={timing.isActive}
                              />
                            }
                          />
                        </dl>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </BatchManageSection>
          );
        })
      )}
    </div>
  );
}
