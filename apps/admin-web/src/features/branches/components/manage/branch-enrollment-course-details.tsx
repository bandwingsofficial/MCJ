"use client";

import type { Course } from "@/src/features/courses/types/course.types";
import type { BatchPricingSource } from "@/src/features/batches/utils/batch-pricing.util";
import { formatBatchPrice } from "@/src/features/batches/utils/batch-pricing.util";
import { formatCourseQualifications } from "@/src/features/courses/utils/course-display.utils";

interface Props {
  course: Course | null;
  pricingSource?: BatchPricingSource | null;
  finalPriceLabel?: string;
  categoryName?: string;
  isLoading?: boolean;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function BranchEnrollmentCourseDetails({
  course,
  pricingSource,
  finalPriceLabel,
  categoryName,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-[#647A9B]">Loading course information...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const qualifications = formatCourseQualifications(
    course.minimumQualifications ?? [],
  );

  const priceLabel =
    finalPriceLabel ??
    (pricingSource ? formatBatchPrice(pricingSource) : "—");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start gap-4">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#102A56]">{course.title}</h3>
          <p className="font-mono text-xs text-slate-500">{course.code}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailRow label="Category" value={categoryName ?? course.category?.name ?? "—"} />
        <DetailRow label="Final Price" value={priceLabel} />
        <DetailRow
          label="Minimum Qualification"
          value={qualifications || "—"}
        />
        <DetailRow
          label="Description"
          value={
            course.shortDescription?.trim() ||
            course.description?.trim()?.slice(0, 120) ||
            "—"
          }
        />
      </div>
    </div>
  );
}
