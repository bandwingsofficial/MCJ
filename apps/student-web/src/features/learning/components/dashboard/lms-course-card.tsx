"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { MetricBadge } from "@/src/features/learning/components/dashboard/metric-badge";
import { LearningProgressBar } from "@/src/features/learning/components/progress/learning-progress-bar";
import type {
  CourseProgressDto,
  StudentCourseDetailDto,
  StudentCourseSummaryDto,
} from "@/src/features/learning/types/learning.types";
import type { CourseContentMetrics } from "@/src/features/learning/utils/course-metrics.utils";
import {
  formatLearningDate,
  type CourseTabStatus,
} from "@/src/features/learning/utils/course-status.utils";
import { getCourseLearningPath } from "@/src/features/learning/utils/routes.utils";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

interface LmsCourseCardProps {
  course: StudentCourseSummaryDto;
  courseDetail: StudentCourseDetailDto;
  progress: CourseProgressDto;
  metrics: CourseContentMetrics;
  tabStatus: CourseTabStatus;
  startedDate: string | null;
  continueLessonPath: string;
}

const statusStyles: Record<
  CourseTabStatus,
  { label: string; className: string }
> = {
  in_progress: {
    label: "In Progress",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  upcoming: {
    label: "Upcoming",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
};

export function LmsCourseCard({
  course,
  courseDetail,
  progress,
  metrics,
  tabStatus,
  startedDate,
  continueLessonPath,
}: LmsCourseCardProps) {
  const status = statusStyles[tabStatus];
  const description =
    courseDetail.shortDescription?.trim() ||
    courseDetail.tagline?.trim() ||
    "";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0B1F3A] sm:text-xl">
              {course.title}
            </h2>
            {description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricBadge label="Modules" value={metrics.modules} tone="blue" />
            <MetricBadge label="Topics" value={metrics.lessons} tone="purple" />
            <MetricBadge label="Resources" value={metrics.resources} tone="green" />
            <MetricBadge label="Videos" value={metrics.videos} tone="orange" />
            <MetricBadge label="Quizzes" value={metrics.quizzes} tone="yellow" />
          </div>

          <p className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            Started {formatLearningDate(startedDate)}
          </p>
        </div>

        <div className="w-full shrink-0 space-y-3 lg:w-56 xl:w-64">
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold",
                status.className,
              )}
            >
              {status.label}
            </span>
            <span className="text-sm font-semibold text-[#0B1F3A]">
              {progress.completionPercentage}%
            </span>
          </div>
          <LearningProgressBar value={progress.completionPercentage} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Link href={getCourseLearningPath(course.courseId)} className="sm:order-1">
          <Button variant="outline" size="sm" className="w-full rounded-lg sm:w-auto">
            View Syllabus
          </Button>
        </Link>
        <Link href={continueLessonPath} className="sm:order-2">
          <Button
            size="sm"
            className="w-full rounded-lg bg-[#0B1F3A] hover:bg-[#102A56] sm:w-auto"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
