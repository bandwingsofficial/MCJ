"use client";

import Image from "next/image";
import {
  BookOpen,
  Clock3,
  ImageOff,
  Monitor,
} from "lucide-react";

import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCourseMode,
  formatDuration,
} from "@/src/features/courses/utils/course-display.utils";

interface EnrollmentCourseSummaryProps {
  course: Course;
  learningMode?: string | null;
  batchName?: string | null;
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D7E4F5] bg-[#F7FAFF] text-[#2563D9]">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-[#0B1F3A]">
          {value}
        </p>
      </div>
    </div>
  );
}

export function EnrollmentCourseSummary({
  course,
  learningMode,
  batchName,
}: EnrollmentCourseSummaryProps) {
  const description =
    course.tagline?.trim() ||
    course.shortDescription?.trim() ||
    null;

  const duration = formatDuration(course.duration, course.durationType);
  const modeLabel = formatCourseMode(learningMode);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2EAF4] bg-white shadow-[0_8px_24px_-18px_rgba(15,40,80,0.35)]">
      <div className="flex items-center gap-2 border-b border-[#EAF0F7] px-4 py-3 sm:px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D7E4F5] bg-[#F7FAFF] text-[#2563D9]">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0B1F3A]">
          Selected Course &amp; Batch
        </h2>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5 sm:p-5">
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl border border-[#E2EAF4] bg-slate-100 sm:mx-0 sm:h-[7.5rem] sm:w-full sm:max-w-[112px]">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
              <ImageOff className="h-5 w-5" />
              <span className="text-[10px] font-medium">No image</span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2563D9]">
            {course.categoryName?.trim() || "Course"}
          </p>

          <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight text-[#0B1F3A] sm:text-xl">
            {course.title}
          </h3>

          {batchName?.trim() ? (
            <p className="mt-1 text-sm font-medium text-slate-500">
              {batchName.trim()}
            </p>
          ) : course.code ? (
            <p className="mt-1 text-sm font-medium text-slate-500">
              {course.code}
            </p>
          ) : null}

          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetaItem icon={Clock3} label="Duration" value={duration} />
            <MetaItem
              icon={Monitor}
              label="Learning Mode"
              value={modeLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
