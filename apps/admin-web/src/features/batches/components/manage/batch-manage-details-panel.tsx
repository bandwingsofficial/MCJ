"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  formatBatchDuration,
  formatBatchDurationType,
} from "@/src/features/batches/utils/batch-duration.utils";
import { getConfiguredModeSummaries } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatBatchEnrollmentCapacityLabel,
  getBatchAggregateStats,
} from "@/src/features/batches/utils/batch-timing.utils";

import {
  BatchManageField,
  BatchManageSection,
} from "./batch-manage-section";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";

interface Props {
  batch: Batch;
  onEdit: () => void;
  editDisabled?: boolean;
}

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={editDisabled || isArchived}
            onClick={onEdit}
            className="h-9"
          >
            <Pencil className="mr-1.5 h-4 w-4 shrink-0" />
            Edit Batch
          </Button>
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
        </dl>
      </BatchManageSection>

      {modeSummaries.map((row) => (
        <BatchManageSection
          key={row.mode}
          title={row.label}
          description="Mode-specific pricing and selected batch timings."
        >
          <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BatchManageField
              label="Batch Timings"
              value={`${row.timingsCount} timing${row.timingsCount === 1 ? "" : "s"}`}
            />
            <BatchManageField
              label="Students"
              value={`${row.studentsCount} student${row.studentsCount === 1 ? "" : "s"}`}
            />
            <BatchManageField
              label="Original Price"
              value={
                row.pricing
                  ? formatMoney(row.pricing.originalPrice, row.pricing.currency)
                  : "—"
              }
            />
            <BatchManageField
              label="Discount Amount"
              value={
                row.pricing
                  ? formatMoney(row.pricing.discountAmount, row.pricing.currency)
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
        </BatchManageSection>
      ))}
    </div>
  );
}
