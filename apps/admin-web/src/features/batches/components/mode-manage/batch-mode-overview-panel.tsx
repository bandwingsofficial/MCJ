"use client";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import {
  getBatchModeLabel,
  getBatchModePricing,
  getModeStudentCount,
  getTimingsForMode,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/batches/components/manage/batch-manage-section";

interface Props {
  batch: Batch;
  mode: BatchMode;
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function BatchModeOverviewPanel({ batch, mode }: Props) {
  const pricing = getBatchModePricing(batch, mode);
  const timings = getTimingsForMode(batch, mode);
  const studentsCount = getModeStudentCount(batch, mode);

  return (
    <div className="space-y-4">
      <BatchManageSection title={`${getBatchModeLabel(mode)} Overview`}>
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Mode" value={getBatchModeLabel(mode)} />
          <BatchManageField
            label="Total Batch Timings"
            value={`${timings.length} timing${timings.length === 1 ? "" : "s"}`}
          />
          <BatchManageField
            label="Total Students"
            value={`${studentsCount} student${studentsCount === 1 ? "" : "s"}`}
          />
          <BatchManageField
            label="Final Price"
            value={
              pricing
                ? pricing.isFree
                  ? "Free"
                  : formatMoney(pricing.discountedPrice, pricing.currency)
                : "—"
            }
          />
          <BatchManageField
            label="Original Price"
            value={
              pricing
                ? formatMoney(pricing.originalPrice, pricing.currency)
                : "—"
            }
          />
          <BatchManageField
            label="Discount Amount"
            value={
              pricing
                ? formatMoney(pricing.discountAmount, pricing.currency)
                : "—"
            }
          />
        </dl>
      </BatchManageSection>
    </div>
  );
}
