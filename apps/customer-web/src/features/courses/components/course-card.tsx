"use client";

import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock3,
  ImageOff,
  ArrowRight,
} from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import type { Course } from "@/src/features/courses/types/course.types";
import {
  getCourseDetailPath,
  getCourseBatchesSectionPath,
} from "@/src/features/courses/utils/course-route.utils";
import {
  formatCoursePrice,
  formatDuration,
} from "@/src/features/courses/utils/course-display.utils";

interface CourseCardProps {
  course: Course;
  batchCount?: number;
  onClick?: (course: Course) => void;
}

function safeText(value?: string | null, fallback = "—") {
  return value?.trim() ? value : fallback;
}

export function CourseCard({
  course,
  batchCount,
  onClick,
}: CourseCardProps) {
  const router = useRouter();

  const handleDetails = () => {
    if (onClick) {
      onClick(course);
      return;
    }

    router.push(getCourseDetailPath(course));
  };

  const handleEnroll = () => {
    router.push(getCourseBatchesSectionPath(course));
  };

  const duration = formatDuration(
    course.duration,
    course.durationType,
  );

  const price = formatCoursePrice(course);

  return (
    <Card
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-lg
      "
    >
      {/* =====================================================
          COURSE IMAGE
      ====================================================== */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={safeText(course.title, "Course preview")}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              flex-col
              items-center
              justify-center
              gap-2
              bg-slate-50
              text-slate-400
            "
          >
            <ImageOff className="h-7 w-7 stroke-[1.5]" />

            <span className="text-xs font-medium">
              No Preview Available
            </span>
          </div>
        )}

        {/* Featured */}
        {course.isFeatured && (
          <div className="absolute left-3 top-3">
            <Badge
              className="
                border-0
                bg-amber-500
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-white
                shadow-sm
              "
            >
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="flex flex-1 flex-col p-4">
        {/* Level + Mode */}
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {course.level && (
            <Badge
              className="
                border-0
                bg-blue-50
                px-2
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-blue-700
              "
            >
              {course.level}
            </Badge>
          )}

        </div>

        {/* Course code */}
        {course.code && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
            {course.code}
          </p>
        )}

        {/* Title */}
        <h3
          className="
            line-clamp-2
            text-base
            font-bold
            leading-snug
            tracking-tight
            text-slate-900
            transition-colors
            group-hover:text-blue-600
          "
        >
          {safeText(course.title, "Untitled Course")}
        </h3>

        {/* Tagline */}
        {course.tagline && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {course.tagline}
          </p>
        )}

        {/* Category + Duration */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
          {course.categoryName && (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              {course.categoryName}
            </span>
          )}

          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-indigo-500" />
            {duration}
          </span>
        </div>

        {/* ===================================================
            BOTTOM ACTION AREA
        ==================================================== */}
        <div className="mt-auto pt-4">
          <div className="border-t border-slate-100 pt-3.5">
            <div className="flex items-end justify-between gap-3">
              {/* Price */}
              <div className="min-w-0">
                <p className="text-lg font-bold leading-none text-slate-900">
                  {price}
                </p>

                {batchCount !== undefined && batchCount > 0 && (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {batchCount} upcoming{" "}
                    {batchCount === 1 ? "batch" : "batches"}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDetails}
                  className="
                    h-9
                    rounded-lg
                    px-3
                    text-xs
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-blue-50
                    hover:text-blue-600
                  "
                >
                  Details
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleEnroll}
                  className="
                    h-9
                    rounded-lg
                    bg-blue-600
                    px-3.5
                    text-xs
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-blue-700
                  "
                >
                  Enroll
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}