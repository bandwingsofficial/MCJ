"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import { CourseRatingMeta } from "@/src/features/courses/components/course-rating-meta";
import type { Course } from "@/src/features/courses/types/course.types";
import { formatCoursePrice } from "@/src/features/courses/utils/course-display.utils";

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

export function HomePopularCourseCard({
  course,
}: HomePopularCourseCardProps) {
  const router = useRouter();
  const description = getCourseDescription(course);

  const handleEnroll = () => {
    router.push(`/courses/${encodeURIComponent(course.slug)}`);
  };

  return (
    <article
      className="
        group flex h-full min-w-0 flex-col
        overflow-hidden
        rounded-xl
        border border-slate-200
        bg-white
        shadow-[0_2px_10px_rgba(15,32,68,0.04)]
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_14px_30px_rgba(15,32,68,0.10)]
      "
    >
      {/* Image */}
      <div className="relative h-[175px] w-full shrink-0 overflow-hidden bg-slate-100">
        {course.thumbnailUrl ? (
          <>
            <Image
              fill
              src={course.thumbnailUrl}
              alt={course.title}
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1024px) 50vw,
                25vw
              "
              className="
                object-cover
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.06]
              "
            />

            <div
              className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-t
                from-[#0f2044]/65
                via-[#0f2044]/10
                to-transparent
              "
              aria-hidden="true"
            />

            <div
              className="
                pointer-events-none
                absolute inset-x-0 bottom-0
                h-16
                bg-gradient-to-t
                from-black/20
                to-transparent
              "
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className="
              flex h-full w-full
              flex-col items-center justify-center
              gap-2
              bg-slate-50
              text-slate-400
            "
          >
            <ImageOff className="h-7 w-7 stroke-[1.4]" />

            <span className="text-[10px] font-medium">
              No Preview Available
            </span>
          </div>
        )}

        {/* Level */}
        <Badge
          variant="default"
          className="
            absolute left-3 top-3
            rounded-full
            border border-white/30
            bg-white/95
            px-2.5 py-1
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-[#0f2044]
            shadow-sm
            backdrop-blur-sm
          "
        >
          {course.level}
        </Badge>

        {/* Popular */}
        <div
          className="
            absolute right-3 top-3
            inline-flex items-center gap-1.5
            rounded-full
            bg-[#d4a84b]
            px-2.5 py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-white
            shadow-[0_4px_12px_rgba(15,32,68,0.18)]
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Popular
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        {/* Course Title */}
        <h3
          className="
            line-clamp-2
            text-[18px]
            font-bold
            leading-snug
            tracking-[-0.015em]
            text-[#0f2044]
            transition-colors
            duration-200
            group-hover:text-[#b8922a]
          "
        >
          {course.title}
        </h3>

        {/* Description */}
        <p
          className="
            mt-1.5
            line-clamp-2
            min-h-[34px]
            text-[11px]
            leading-relaxed
            text-slate-500
          "
        >
          {description ||
            "Build practical skills with expert-led training."}
        </p>

        {/* Category + Rating */}
        <div className="mt-3 flex min-w-0 items-center gap-3">
          {/* Category */}
          <div
            className="
              flex min-w-0
              items-center gap-1.5
              rounded-md
              bg-slate-50
              px-2
              py-1.5
            "
          >
            <BookOpen className="h-3 w-3 shrink-0 text-[#b8922a]" />

            <span className="truncate text-[10px] font-medium text-slate-600">
              {course.categoryName || "General"}
            </span>
          </div>

          {/* Rating */}
          <div className="min-w-0 shrink">
            <CourseRatingMeta
              rating={course.averageRating}
              totalReviews={course.totalReviews}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4">
          <div className="mb-3 h-px bg-slate-100" />

          <div className="flex items-end justify-between gap-3">
            {/* Price */}
            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Course Fee
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[17px]
                  font-bold
                  leading-none
                  tracking-tight
                  text-[#0f2044]
                "
              >
                {formatHomeCoursePrice(course)}
              </p>
            </div>

            {/* Enroll */}
            <Button
              type="button"
              size="sm"
              className="
                h-8
                shrink-0
                rounded-lg
                bg-[#0f2044]
                px-3.5
                text-[10px]
                font-semibold
                text-white
                shadow-none
                transition-all
                duration-200
                hover:bg-[#18345f]
                hover:shadow-[0_5px_14px_rgba(15,32,68,0.18)]
              "
              onClick={handleEnroll}
            >
              Enroll Now

              <ArrowRight
                className="
                  ml-1
                  h-3 w-3
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}