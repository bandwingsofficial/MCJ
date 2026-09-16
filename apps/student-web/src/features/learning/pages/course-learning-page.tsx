"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { MetricBadge } from "@/src/features/learning/components/dashboard/metric-badge";
import { SyllabusModuleAccordion } from "@/src/features/learning/components/syllabus/syllabus-module-accordion";
import { LearningProgressBar } from "@/src/features/learning/components/progress/learning-progress-bar";
import {
  useCourseCompletion,
  useStudentCourse,
} from "@/src/features/learning/hooks/use-learning-queries";
import { getCourseContentMetrics } from "@/src/features/learning/utils/course-metrics.utils";
import {
  buildProgressMap,
  findContinueLesson,
  getCourseProgressStats,
} from "@/src/features/learning/utils/progress.utils";
import {
  getLessonLearningPath,
} from "@/src/features/learning/utils/routes.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface CourseLearningPageProps {
  courseId: string;
}

export function CourseLearningPage({ courseId }: CourseLearningPageProps) {
  const courseQuery = useStudentCourse(courseId);
  const completionQuery = useCourseCompletion(courseId);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const payload = courseQuery.data;

  const progressMap = useMemo(
    () => buildProgressMap(payload?.progress.items ?? []),
    [payload?.progress.items],
  );

  const stats = useMemo(
    () =>
      payload
        ? getCourseProgressStats(payload.course.modules, payload.progress)
        : null,
    [payload],
  );

  const metrics = useMemo(
    () => (payload ? getCourseContentMetrics(payload.course) : null),
    [payload],
  );

  const continueLesson = useMemo(
    () =>
      payload
        ? findContinueLesson(payload.course.modules, progressMap)
        : null,
    [payload, progressMap],
  );

  if (courseQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (courseQuery.isError || !payload || !stats || !metrics) {
    return (
      <ErrorState
        title="Unable to load syllabus"
        description="This course syllabus could not be loaded."
        onRetry={() => {
          void courseQuery.refetch();
        }}
      />
    );
  }

  const { course, progress } = payload;
  const isCompleted = completionQuery.data?.isCourseCompleted ?? false;

  return (
    <div className="space-y-6">
      <Link
        href="/student/learning"
        className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Learning
      </Link>

      <Card className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1F3A]">{course.title}</h1>
              {course.shortDescription || course.tagline ? (
                <p className="mt-1 text-sm text-slate-600">
                  {course.shortDescription ?? course.tagline}
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
          </div>

          <div className="w-full shrink-0 space-y-3 lg:w-56">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Course Progress</span>
              <span className="font-semibold text-[#0B1F3A]">
                {progress.completionPercentage}%
              </span>
            </div>
            <LearningProgressBar value={progress.completionPercentage} />
            {continueLesson ? (
              <Link href={getLessonLearningPath(courseId, continueLesson.id)}>
                <Button className="w-full rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]">
                  Continue Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      {isCompleted ? (
        <Card className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
          Course completed — {progress.completedLessons}/{progress.totalLessons}{" "}
          topics finished.
        </Card>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F3A]">Syllabus</h2>
          <p className="text-sm text-slate-500">
            {stats.completedModules}/{stats.totalModules} modules ·{" "}
            {stats.completedLessons}/{stats.totalLessons} topics completed
          </p>
        </div>

        {course.modules.length === 0 ? (
          <EmptyState
            title="No modules available"
            description="Course modules will appear here once they are published."
          />
        ) : (
          <SyllabusModuleAccordion
            courseId={courseId}
            modules={course.modules}
            progressMap={progressMap}
            expandedModuleId={expandedModuleId}
            onToggleModule={(moduleId) =>
              setExpandedModuleId((current) =>
                current === moduleId ? null : moduleId,
              )
            }
          />
        )}
      </section>
    </div>
  );
}
