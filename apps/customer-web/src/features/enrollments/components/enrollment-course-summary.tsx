"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";

import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCourseLevel,
  formatCourseMode,
} from "@/src/features/courses/utils/course-display.utils";

interface EnrollmentCourseSummaryProps {
  course: Course;
}

export function EnrollmentCourseSummary({
  course,
}: EnrollmentCourseSummaryProps) {
  const description =
    course.tagline?.trim() ||
    course.shortDescription?.trim() ||
    course.description?.trim() ||
    null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative h-48 bg-slate-100 md:h-full md:min-h-[220px]">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="220px"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff className="h-8 w-8" />
              <span className="text-xs font-medium">No Preview</span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
            {course.categoryName || "Course"}
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {course.title}
          </h2>

          {course.code ? (
            <p className="mt-1 text-sm font-medium text-slate-500">
              {course.code}
            </p>
          ) : null}

          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {course.level ? (
              <Badge variant="info">
                {formatCourseLevel(course.level)}
              </Badge>
            ) : null}
            {course.mode ? (
              <Badge variant="default">
                {formatCourseMode(course.mode)}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
