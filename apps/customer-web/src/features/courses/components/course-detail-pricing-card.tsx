"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type {
  Course,
  CourseSummary,
} from "@/src/features/courses/types/course.types";

import { getCourseBatchesSectionPath } from "@/src/features/courses/utils/course-route.utils";

interface CourseDetailPricingCardProps {
  course: Course;
  summary?: CourseSummary;
  batchCount: number;
  sticky?: boolean;
  variant?: "default" | "cta";
  onPrimaryAction?: () => void;
}

export function CourseDetailPricingCard({
  course,
  batchCount,
  sticky = true,
  variant = "default",
  onPrimaryAction,
}: CourseDetailPricingCardProps) {
  const router = useRouter();

  const isEnrolled = Boolean(course.isEnrolled);
  const hasBatches = batchCount > 0;

  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }

    if (isEnrolled) {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    router.push(getCourseBatchesSectionPath(course));
  };

  const buttonLabel = isEnrolled ? "Continue Learning" : "Enroll Now";

  if (variant === "cta") {
    return (
      <Button
        type="button"
        onClick={handlePrimaryAction}
        className="
          h-12
          rounded-xl
          px-6
          text-sm
          font-semibold
          shadow-sm
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
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Enrollment
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Select a branch and batch to view fees and continue enrollment.
          </p>

          <Button
            type="button"
            onClick={handlePrimaryAction}
            className="
              mt-6
              h-12
              w-full
              rounded-xl
              text-sm
              font-semibold
              shadow-sm
            "
          >
            {buttonLabel}

            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

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

        {(hasBatches || isEnrolled) && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            {isEnrolled ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                You are already enrolled in this course.
              </div>
            ) : (
              <p className="text-center text-xs leading-relaxed text-slate-500">
                Select a batch below to continue enrollment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
