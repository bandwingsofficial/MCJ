"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import {
  formatBatchPrice,
  getBatchDiscountPercent,
  hasBatchDiscount,
} from "@/src/features/batches/utils/batch-pricing.utils";
import type { CourseModeFeeRow } from "@/src/features/courses/utils/course-batch.utils";

interface CourseFeesSectionProps {
  rows: CourseModeFeeRow[];
  isLoading?: boolean;
}

export function CourseFeesSection({
  rows,
  isLoading = false,
}: CourseFeesSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          Fees will be published when upcoming batches are available.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Contact us for the latest pricing and enrollment options.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => {
        const discountPercent = getBatchDiscountPercent(row.pricing);
        const showDiscount = hasBatchDiscount(row.pricing);

        return (
          <article
            key={row.mode}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563D9]">
              {row.modeLabel}
            </p>

            <div className="mt-4 space-y-2">
              {row.pricing.isFree ? (
                <p className="text-2xl font-bold text-emerald-600">Free</p>
              ) : (
                <>
                  {showDiscount ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-slate-400 line-through">
                        {formatBatchPrice({
                          ...row.pricing,
                          discountedPrice: row.pricing.originalPrice,
                        })}
                      </p>
                      {discountPercent ? (
                        <Badge className="border-0 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-50">
                          {discountPercent}% OFF
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}

                  <p className="text-2xl font-bold text-[#0B1F3A]">
                    {formatBatchPrice(row.pricing)}
                  </p>

                  {showDiscount ? (
                    <p className="text-xs text-slate-500">
                      Final payable amount after discount
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                {row.timingCount}{" "}
                {row.timingCount === 1 ? "upcoming timing" : "upcoming timings"}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
