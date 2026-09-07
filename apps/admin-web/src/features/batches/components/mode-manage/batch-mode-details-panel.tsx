"use client";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import {
  getBatchModeLabel,
  getBatchModePricing,
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

export function BatchModeDetailsPanel({ batch, mode }: Props) {
  const pricing = getBatchModePricing(batch, mode);
  const timings = getTimingsForMode(batch, mode);
  const timingNames = timings.map((timing) => timing.name).join(", ");

  return (
    <BatchManageSection
      title={`${getBatchModeLabel(mode)} Configuration`}
      description="Mode-specific pricing and selected batch timings for this parent batch."
    >
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BatchManageField label="Mode" value={getBatchModeLabel(mode)} />
        <BatchManageField
          label="Selected Batch Timings"
          value={timingNames || "—"}
        />
        <BatchManageField
          label="Original Price"
          value={
            pricing ? formatMoney(pricing.originalPrice, pricing.currency) : "—"
          }
        />
        <BatchManageField
          label="Discount Amount"
          value={
            pricing ? formatMoney(pricing.discountAmount, pricing.currency) : "—"
          }
        />
        <BatchManageField
          label="Discount Percentage"
          value={
            pricing?.discountPercent != null
              ? `${pricing.discountPercent}%`
              : pricing && pricing.originalPrice > 0
                ? `${Math.round((pricing.discountAmount / pricing.originalPrice) * 10000) / 100}%`
                : "—"
          }
        />
        <BatchManageField
          label="Final Amount"
          value={
            pricing
              ? pricing.isFree
                ? "Free"
                : formatMoney(pricing.discountedPrice, pricing.currency)
              : "—"
          }
        />
      </dl>
    </BatchManageSection>
  );
}
