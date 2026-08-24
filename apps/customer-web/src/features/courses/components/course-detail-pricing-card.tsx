"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type {
  Course,
  CourseSummary,
} from "@/src/features/courses/types/course.types";

import {
  formatCurrency,
  formatDetailCoursePrice,
  getCoursePricing,
  getDiscountPercent,
} from "@/src/features/courses/utils/course-display.utils";

import { getCourseEnrollPath } from "@/src/features/courses/utils/course-route.utils";

interface CourseDetailPricingCardProps {
  course: Course;
  summary?: CourseSummary;
  batchCount: number;
  sticky?: boolean;
  variant?: "default" | "cta";
}

export function CourseDetailPricingCard({
  course,
  summary,
  batchCount,
  sticky = true,
  variant = "default",
}: CourseDetailPricingCardProps) {
  const router = useRouter();

  const pricing = getCoursePricing(course);
  const discountPercent = getDiscountPercent(course) ?? 0;

  const isEnrolled = Boolean(course.isEnrolled);
  const isFree = pricing.isFree;

  const showOriginalPrice =
    !isFree &&
    pricing.originalPrice > pricing.discountedPrice;

  const hasBatches = batchCount > 0;

  const handlePrimaryAction = () => {
    if (isEnrolled) {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    router.push(getCourseEnrollPath(course));
  };

  const buttonLabel = isEnrolled
    ? "Continue Learning"
    : isFree
      ? "Start Learning"
      : "Enroll Now";

  /*
   * CTA VARIANT
   *
   * Used when the parent page only needs the primary
   * enrollment button.
   */
  if (variant === "cta") {
    return (
      <Button
        type="button"
        onClick={handlePrimaryAction}
        className="
          h-12
          rounded-xl
          bg-blue-600
          px-6
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          focus-visible:ring-2
          focus-visible:ring-blue-500
          focus-visible:ring-offset-2
        "
      >
        {buttonLabel}

        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={sticky ? "lg:sticky lg:top-24" : undefined}>
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        {/* =====================================================
            PRICE SECTION
        ====================================================== */}
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Course Fee
          </p>

          {/* Free course */}
          {isFree ? (
            <div className="mt-3">
              <p className="text-3xl font-bold tracking-tight text-slate-900">
                Free
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                No payment required
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex flex-wrap items-end gap-2">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatDetailCoursePrice(course)}
                </p>

                {showOriginalPrice && (
                  <p className="pb-1 text-sm text-slate-400 line-through">
                    {formatCurrency(
                      pricing.originalPrice,
                      pricing.currency,
                    )}
                  </p>
                )}
              </div>

              {discountPercent > 0 && (
                <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1">
                  <span className="text-xs font-semibold text-emerald-700">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ===================================================
              PRIMARY ACTION
          ==================================================== */}
          <Button
            type="button"
            onClick={handlePrimaryAction}
            className="
              mt-6
              h-12
              w-full
              rounded-xl
              bg-blue-600
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              focus-visible:ring-2
              focus-visible:ring-blue-500
              focus-visible:ring-offset-2
            "
          >
            {buttonLabel}

            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* ===================================================
              BATCH AVAILABILITY
          ==================================================== */}
          {hasBatches ? (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

              <span>
                {batchCount} available{" "}
                {batchCount === 1 ? "batch" : "batches"}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-center text-xs font-medium text-amber-600">
              No batches available right now
            </p>
          )}
        </div>

        {/* =====================================================
            SMALL TRUST / INFORMATION AREA
        ====================================================== */}
        {(hasBatches || isEnrolled) && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            {isEnrolled ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                You are already enrolled in this course.
              </div>
            ) : (
              <p className="text-center text-xs leading-relaxed text-slate-500">
                Select an available batch during enrollment to
                continue.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}