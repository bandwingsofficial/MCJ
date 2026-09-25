"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import {
  formatCurrency,
  hasBatchDiscount,
} from "@/src/features/batches/utils/batch-pricing.utils";
import { ONLINE_ENROLLMENT_ADVANCE_AMOUNT } from "@/src/features/enrollments/constants/enrollment-payment.constants";
import { resolveModePricing } from "@/src/features/courses/utils/course-batch.utils";

interface EnrollmentOrderSummaryProps {
  selectedBatch: Batch | null;
  learningMode?: string | null;
  isBatchLoading?: boolean;
  coinDiscount?: number;
  isFreeOverride?: boolean;
}

function formatFeeAmount(amount: number, currency: string): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function SummaryRow({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={`text-slate-600 ${labelClassName ?? ""}`}>{label}</span>
      <span
        className={`shrink-0 text-right font-medium tabular-nums text-slate-900 ${valueClassName ?? ""}`}
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
  coinDiscount = 0,
  isFreeOverride = false,
}: EnrollmentOrderSummaryProps) {
  const mode = (learningMode?.toUpperCase() ||
    selectedBatch?.mode ||
    "OFFLINE") as BatchMode;
  const pricing = selectedBatch
    ? resolveModePricing(selectedBatch, mode)
    : null;
  const showBatchDiscount = pricing ? hasBatchDiscount(pricing) : false;
  const courseFee = pricing?.discountedPrice ?? 0;
  const grandTotal = Math.max(0, courseFee - coinDiscount);
  const advanceAmount = Math.min(
    ONLINE_ENROLLMENT_ADVANCE_AMOUNT,
    grandTotal,
  );
  const offlineDue = Math.max(0, grandTotal - advanceAmount);
  const isFree = isFreeOverride || Boolean(pricing?.isFree) || grandTotal <= 0;
  const currency = pricing?.currency ?? "INR";

  return (
    <section className="rounded-2xl border border-[#E2EAF4] bg-white p-5 shadow-[0_8px_24px_-18px_rgba(15,40,80,0.2)] sm:p-6">
      <h3 className="text-base font-semibold tracking-tight text-[#0B1F3A]">
        Fee Summary
      </h3>

      <div className="mt-5">
        {isBatchLoading ? (
          <div className="space-y-3">
            <SummaryValueSkeleton />
            <SummaryValueSkeleton />
          </div>
        ) : !selectedBatch || !pricing ? (
          <p className="text-sm text-slate-500">
            Select a batch to view fees.
          </p>
        ) : isFree ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Amount</span>
            <span className="text-2xl font-bold text-emerald-600">FREE</span>
          </div>
        ) : (
          <div className="space-y-4">
            {showBatchDiscount ? (
              <div className="space-y-2 pb-1">
                <SummaryRow
                  label="Original Price"
                  value={formatFeeAmount(pricing.originalPrice, currency)}
                />
                <SummaryRow
                  label="Batch Discount"
                  value={`-${formatFeeAmount(pricing.discountAmount, currency)}`}
                  valueClassName="text-emerald-700"
                />
              </div>
            ) : null}

            <div className="space-y-2.5">
              <SummaryRow
                label="Course Fee"
                value={formatFeeAmount(courseFee, currency)}
              />
              {coinDiscount > 0 ? (
                <SummaryRow
                  label="Coin Discount"
                  value={`-${formatFeeAmount(coinDiscount, currency)}`}
                  labelClassName="text-emerald-800/80"
                  valueClassName="font-semibold text-emerald-700"
                />
              ) : null}
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#0B1F3A]">
                  Grand Total
                </span>
                <span className="text-xl font-bold tabular-nums tracking-tight text-[#0B1F3A]">
                  {formatFeeAmount(grandTotal, currency)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#D7E4F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EEF4FC] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2563D9]">
                    Pay Now
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#0B1F3A]">
                    {formatFeeAmount(advanceAmount, currency)}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Only the advance is payable online.
                  </p>
                </div>
                <div className="sm:border-l sm:border-[#D7E4F5] sm:pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Due After Joining
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#0B1F3A]">
                    {formatFeeAmount(offlineDue, currency)}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Payable offline after joining.
                  </p>
                </div>
              </div>
              <p className="mt-4 border-t border-[#D7E4F5]/80 pt-3 text-xs leading-relaxed text-slate-600">
                Only the {formatCurrency(advanceAmount, currency)} advance
                payment is payable online now. The remaining amount will be paid
                offline after joining — you are not paying the full Grand Total
                online.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
