"use client";

import Link from "next/link";
import {
  ArrowRight,
  Monitor,
  PlayCircle,
  Video,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { BatchMode } from "@/src/features/batches/types/batch.types";
import {
  formatBatchPrice,
  getBatchDiscountPercent,
  hasBatchDiscount,
} from "@/src/features/batches/utils/batch-pricing.utils";
import type { CourseModeFeeRow } from "@/src/features/courses/utils/course-batch.utils";

interface CourseFeesSectionProps {
  rows: CourseModeFeeRow[];
  isLoading?: boolean;
  onJoin?: () => void;
  joinHref?: string | null;
}

const MODE_META: Record<
  BatchMode,
  {
    title: string;
    accent: string;
    iconWrap: string;
    Icon: typeof Monitor;
  }
> = {
  OFFLINE: {
    title: "Offline / Classroom",
    accent: "text-orange-700",
    iconWrap: "bg-orange-50 text-orange-600",
    Icon: Monitor,
  },
  ONLINE: {
    title: "Online",
    accent: "text-blue-700",
    iconWrap: "bg-blue-50 text-blue-600",
    Icon: Video,
  },
  RECORDED: {
    title: "Self-Paced / Pre-Recorded",
    accent: "text-purple-700",
    iconWrap: "bg-purple-50 text-purple-600",
    Icon: PlayCircle,
  },
};

export function CourseFeesSection({
  rows,
  isLoading = false,
  onJoin,
  joinHref,
}: CourseFeesSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
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
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="divide-y divide-slate-100">
        {rows.map((row) => {
          const meta = MODE_META[row.mode];
          const discountPercent = getBatchDiscountPercent(row.pricing);
          const showDiscount = hasBatchDiscount(row.pricing);
          const Icon = meta.Icon;

          return (
            <div
              key={row.mode}
              className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    meta.iconWrap,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-[0.14em]",
                      meta.accent,
                    )}
                  >
                    {meta.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.timingCount} upcoming{" "}
                    {row.timingCount === 1 ? "timing" : "timings"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="min-w-[120px]">
                  {row.pricing.isFree ? (
                    <p className="text-2xl font-bold text-emerald-600">Free</p>
                  ) : (
                    <>
                      {showDiscount ? (
                        <div className="mb-1 flex flex-wrap items-center gap-2">
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
                    </>
                  )}
                </div>

                {joinHref ? (
                  <Link href={joinHref}>
                    <Button
                      type="button"
                      className="h-10 rounded-xl bg-[#0B1F3A] px-4 text-xs font-semibold text-white hover:bg-[#132a4a]"
                    >
                      Join Now
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : onJoin ? (
                  <Button
                    type="button"
                    onClick={onJoin}
                    className="h-10 rounded-xl bg-[#0B1F3A] px-4 text-xs font-semibold text-white hover:bg-[#132a4a]"
                  >
                    View Batches
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
