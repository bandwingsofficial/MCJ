"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock3, ImageOff } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCoursePrice,
  formatDuration,
} from "@/src/features/courses/utils/course-display.utils";

interface CourseCardProps {
  course: Course;
  batchCount?: number;
  onClick?: (course: Course) => void;
}

export function CourseCard({ course, batchCount, onClick }: CourseCardProps) {
  const router = useRouter();

  return (
    <Card className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col h-full rounded-lg">
      <div className="relative h-36 w-full overflow-hidden bg-muted flex items-center justify-center border-b border-border/60">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-muted/60 to-muted text-muted-foreground/60">
            <ImageOff className="h-6 w-6 stroke-[1.5]" />
            <span className="text-[11px] font-medium">No Preview Available</span>
          </div>
        )}

        {course.isFeatured && (
          <div className="absolute left-2 top-2">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-2 py-0 text-[10px] font-semibold shadow-sm">
              Featured
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Badge variant="default" className="text-[10px] px-1.5 py-0 font-medium bg-gold text-secondary-foreground uppercase tracking-wide">
            {course.level}
          </Badge>
          {course.mode && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 font-medium text-muted-foreground">
              {course.mode}
            </Badge>
          )}
        </div>

        <p className="text-xs font-medium text-indigo-600">{course.code}</p>

        <div className="mb-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          {course.tagline && (
            <p className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
              {course.tagline}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.categoryName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {formatDuration(course.duration, course.durationType)}
          </span>
        </div>

        <div className="mt-auto pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-foreground">
              {formatCoursePrice(course)}
            </p>
            {batchCount !== undefined && batchCount > 0 ? (
              <p className="text-[11px] text-muted-foreground">
                {batchCount} upcoming batch{batchCount === 1 ? "" : "es"}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground h-8 px-2"
              onClick={() => onClick?.(course)}
            >
              Details
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] shadow-sm h-8 px-3 rounded-md transition-colors"
              onClick={() => router.push(`/courses/${course.slug}/enroll`)}
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
