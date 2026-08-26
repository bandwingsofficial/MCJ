"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock3, ImageOff } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCoursePrice,
  formatDuration,
} from "@/src/features/courses/utils/course-display.utils";
import { getCourseDetailPath, getCourseBatchesSectionPath } from "@/src/features/courses/utils/course-route.utils";

interface HomePopularCourseCardProps {
  course: Course;
}

function formatHomeCoursePrice(course: Course): string {
  return formatCoursePrice(course);
}

function getCourseDescription(course: Course): string | null {
  const description =
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    course.description?.trim();

  return description || null;
}

export function HomePopularCourseCard({ course }: HomePopularCourseCardProps) {
  const router = useRouter();
  const description = getCourseDescription(course);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="block h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
            <ImageOff className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[10px] font-medium">No Preview Available</span>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-1">
          <Badge
            variant="default"
            className="rounded-sm px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide"
          >
            {course.level}
          </Badge>
        </div>

        <p className="text-[11px] font-medium leading-tight text-blue-600">
          {course.code}
        </p>

        <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">
          {course.title}
        </h3>

        {description ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
            {description}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1">
            <BookOpen className="h-3 w-3 shrink-0" />
            <span className="truncate">{course.categoryName || "—"}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {formatDuration(course.duration, course.durationType)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2">
          <p className="shrink-0 text-[13px] font-bold leading-none text-slate-900">
            {formatHomeCoursePrice(course)}
          </p>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="whitespace-nowrap text-[10px] font-medium text-blue-600 hover:text-blue-700"
              onClick={() => router.push(getCourseDetailPath(course))}
            >
              Details
            </button>
            <Button
              size="sm"
              className="h-7 shrink-0 rounded-md bg-blue-600 px-2.5 text-[10px] font-medium text-white shadow-none hover:bg-blue-700"
              onClick={() => router.push(getCourseBatchesSectionPath(course))}
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
