"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import type { Course } from "@/src/features/courses/types/course.types";
import { getCourseBatchesSectionPath } from "@/src/features/courses/utils/course-route.utils";

interface EnrollmentMissingBatchProps {
  course: Course;
}

export function EnrollmentMissingBatch({
  course,
}: EnrollmentMissingBatchProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
        <CalendarDays className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900">
        Please select a branch and batch to continue
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Choose a branch and then a batch from the course page before completing
        your enrollment.
      </p>

      <Link
        href={getCourseBatchesSectionPath(course)}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
      >
        View Available Branches
      </Link>
    </section>
  );
}
