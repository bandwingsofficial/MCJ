"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import {
  formatCurrency,
  hasBatchDiscount,
} from "@/src/features/batches/utils/batch-pricing.utils";
import { resolveModePricing } from "@/src/features/courses/utils/course-batch.utils";

interface EnrollmentOrderSummaryProps {
  selectedBatch: Batch | null;
  learningMode?: string | null;
  isBatchLoading?: boolean;
}

function SummaryRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`text-right font-medium ${
          emphasize ? "text-base text-slate-900" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryValueSkeleton() {
  return <Skeleton className="ml-auto h-4 w-28" />;
}

export function EnrollmentOrderSummary({
  selectedBatch,
  learningMode,
  isBatchLoading = false,
}: EnrollmentOrderSummaryProps) {
  const mode = (learningMode?.toUpperCase() ||
    selectedBatch?.mode ||
    "OFFLINE") as BatchMode;
  const pricing = selectedBatch
    ? resolveModePricing(selectedBatch, mode)
    : null;
  const showDiscount = pricing ? hasBatchDiscount(pricing) : false;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">Fee Summary</h3>

      <div className="mt-5 space-y-3">
        {isBatchLoading ? (
          <>
            <SummaryValueSkeleton />
            <SummaryValueSkeleton />
          </>
        ) : !selectedBatch || !pricing ? (
          <p className="text-sm text-slate-500">
            Select a batch to view fees.
          </p>
        ) : pricing.isFree ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Amount</span>
            <span className="text-2xl font-bold text-emerald-600">FREE</span>
          </div>
        ) : showDiscount ? (
          <>
            <SummaryRow
              label="Original Price"
              value={formatCurrency(pricing.originalPrice, pricing.currency)}
            />
            <SummaryRow
              label="Discount"
              value={`-${formatCurrency(
                pricing.discountAmount,
                pricing.currency,
              )}`}
            />
            <div className="border-t border-slate-200 pt-3">
              <SummaryRow
                label="Final Amount"
                value={formatCurrency(
                  pricing.discountedPrice,
                  pricing.currency,
                )}
                emphasize
              />
            </div>
          </>
        ) : (
          <SummaryRow
            label="Amount"
            value={formatCurrency(pricing.discountedPrice, pricing.currency)}
            emphasize
          />
        )}
      </div>
    </section>
  );
}
