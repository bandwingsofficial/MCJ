"use client";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch } from "@/src/features/batches/types/batch.types";
import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCurrency,
  getCoursePricing,
  hasCourseDiscount,
} from "@/src/features/courses/utils/course-display.utils";
import {
  formatBatchBranchName,
  formatBatchSummaryLabel,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

interface EnrollmentOrderSummaryProps {
  course: Course;
  selectedBatch: Batch | null;
  isBatchLoading?: boolean;
  hasBatchId?: boolean;
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
  course,
  selectedBatch,
  isBatchLoading = false,
  hasBatchId = false,
}: EnrollmentOrderSummaryProps) {
  const pricing = getCoursePricing(course);
  const showDiscount = hasCourseDiscount(course);
  const discountPercent =
    pricing.discountPercent > 0
      ? Math.round(pricing.discountPercent)
      : null;

  const batchLabel = isBatchLoading
    ? null
    : selectedBatch
      ? formatBatchSummaryLabel(selectedBatch)
      : hasBatchId
        ? "Unavailable"
        : "—";

  const branchLabel = isBatchLoading
    ? null
    : hasBatchId || selectedBatch
      ? formatBatchBranchName(selectedBatch)
      : "—";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">Fee Summary</h3>

      <div className="mt-5 space-y-3">
        <SummaryRow label="Course" value={course.title} />

        <div className="flex items-start justify-between gap-4 text-sm">
          <span className="text-slate-500">Batch</span>
          {isBatchLoading ? (
            <SummaryValueSkeleton />
          ) : (
            <span className="text-right font-medium text-slate-900">
              {batchLabel}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 text-sm">
          <span className="text-slate-500">Branch</span>
          {isBatchLoading ? (
            <SummaryValueSkeleton />
          ) : (
            <span className="text-right font-medium text-slate-900">
              {branchLabel}
            </span>
          )}
        </div>
      </div>

      <div className="my-5 border-t border-slate-200" />

      {pricing.isFree ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Total</span>
          <span className="text-2xl font-bold text-emerald-600">FREE</span>
        </div>
      ) : (
        <div className="space-y-3">
          {showDiscount ? (
            <>
              <SummaryRow
                label="Original Price"
                value={formatCurrency(
                  pricing.originalPrice,
                  pricing.currency,
                )}
              />
              <SummaryRow
                label="Discount Amount"
                value={`-${formatCurrency(
                  pricing.discountAmount,
                  pricing.currency,
                )}`}
              />
              {discountPercent ? (
                <SummaryRow
                  label="Discount %"
                  value={`${discountPercent}% OFF`}
                />
              ) : null}
            </>
          ) : (
            <SummaryRow
              label="Original Price"
              value={formatCurrency(
                pricing.originalPrice,
                pricing.currency,
              )}
            />
          )}

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
        </div>
      )}
    </section>
  );
}
