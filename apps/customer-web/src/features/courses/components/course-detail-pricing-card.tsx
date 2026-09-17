"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Course } from "@/src/features/courses/types/course.types";

import { getCourseBatchesSectionPath } from "@/src/features/courses/utils/course-route.utils";

interface CourseDetailPricingCardProps {
  course: Course;
  batchCount: number;
  sticky?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export function CourseDetailPricingCard({
  course,
  batchCount,
  sticky = true,
  onPrimaryAction,
  onSecondaryAction,
}: CourseDetailPricingCardProps) {
  const router = useRouter();

  const isEnrolled = Boolean(course.isEnrolled);
  const hasBatches = batchCount > 0;

  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }

    router.push(
      `/contact?course=${encodeURIComponent(course.slug)}&courseId=${course.id}`,
    );
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
      return;
    }

    if (isEnrolled) {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    router.push(getCourseBatchesSectionPath(course));
  };

  const primaryLabel = isEnrolled ? "Continue Learning" : "Enquire Now";
  const secondaryLabel = isEnrolled ? "View Course" : "Enroll Now";

  return (
    <div className={sticky ? "lg:sticky lg:top-24" : undefined}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Get Started
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Enquire about fees, schedules, and enrollment options for this course.
          </p>

          <Button
            type="button"
            onClick={handlePrimaryAction}
            className="mt-6 h-12 w-full rounded-xl text-sm font-semibold shadow-sm"
          >
            {primaryLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {!isEnrolled ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleSecondaryAction}
              className="mt-3 h-11 w-full rounded-xl border-slate-200 text-sm font-semibold text-[#2563D9] hover:bg-blue-50"
            >
              {secondaryLabel}
            </Button>
          ) : null}

          {hasBatches ? (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {batchCount} upcoming{" "}
                {batchCount === 1 ? "batch" : "batches"}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-center text-xs font-medium text-amber-600">
              No upcoming batches right now
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          {isEnrolled ? (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              You are already enrolled in this course.
            </div>
          ) : (
            <p className="text-center text-xs leading-relaxed text-slate-500">
              Need help choosing a batch?{" "}
              <Link
                href={`/contact?course=${encodeURIComponent(course.slug)}`}
                className="font-semibold text-[#2563D9] hover:text-[#1746A2]"
              >
                Contact us
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
