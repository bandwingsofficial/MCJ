"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Course } from "@/src/features/courses/types/course.types";

import {
  formatCurrency,
  formatDetailCoursePrice,
  getCoursePricing,
  getDiscountPercent,
} from "@/src/features/courses/utils/course-display.utils";

import { getCourseEnrollPath } from "@/src/features/courses/utils/course-route.utils";

interface CourseDetailPricingSectionProps {
  course: Course;
}

export function CourseDetailPricingSection({
  course,
}: CourseDetailPricingSectionProps) {
  const router = useRouter();

  const pricing = getCoursePricing(course);

  // Normalize null → 0 so the UI and TypeScript are both happy.
  const discountPercent = getDiscountPercent(course) ?? 0;

  const isEnrolled = Boolean(course.isEnrolled);
  const isFree = Boolean(course.isFree);

  const showOriginalPrice =
    !isFree &&
    Number.isFinite(pricing.original) &&
    pricing.original > pricing.finalPrice;

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

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center">
        {/* =====================================================
            PRICE
        ====================================================== */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            Course Fee
          </p>

          {isFree ? (
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 sm:text-3xl">
              Free
            </p>
          ) : (
            <>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {showOriginalPrice && (
                  <p className="text-sm text-slate-400 line-through">
                    {formatCurrency(
                      pricing.original,
                      pricing.currency,
                    )}
                  </p>
                )}

                {discountPercent > 0 && (
                  <p className="text-sm font-semibold text-emerald-600">
                    {discountPercent}% off
                  </p>
                )}
              </div>

              <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {formatDetailCoursePrice(course)}
              </p>
            </>
          )}
        </div>

        {/* =====================================================
            PRIMARY ACTION
        ====================================================== */}
        <Button
          type="button"
          onClick={handlePrimaryAction}
          className="
            h-11
            w-full
            shrink-0
            rounded-lg
            bg-blue-600
            px-8
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-colors
            hover:bg-blue-700
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
            sm:w-auto
          "
        >
          {buttonLabel}

          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}