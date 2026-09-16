"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { LearningProgressBar } from "@/src/features/learning/components/progress/learning-progress-bar";
import {
  useLearningDashboard,
  useStudentCourse,
  useStudentModule,
} from "@/src/features/learning/hooks/use-learning-queries";
import {
  buildProgressMap,
  formatLessonLabel,
  formatModuleLabel,
  getModuleProgress,
} from "@/src/features/learning/utils/progress.utils";
import {
  getCourseLearningPath,
  getLessonLearningPath,
} from "@/src/features/learning/utils/routes.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface ModuleLearningPageProps {
  courseId: string;
  moduleId: string;
}

export function ModuleLearningPage({
  courseId,
  moduleId,
}: ModuleLearningPageProps) {
  const moduleQuery = useStudentModule(courseId, moduleId);
  const courseQuery = useStudentCourse(courseId);
  const dashboardQuery = useLearningDashboard();

  const progressMap = useMemo(
    () => buildProgressMap(courseQuery.data?.progress.items ?? []),
    [courseQuery.data?.progress.items],
  );

  const moduleProgress = useMemo(
    () =>
      moduleQuery.data
        ? getModuleProgress(moduleQuery.data, progressMap)
        : null,
    [moduleQuery.data, progressMap],
  );

  const courseTitle =
    courseQuery.data?.course.title ??
    dashboardQuery.data?.find((item) => item.course.courseId === courseId)?.course
      .title ??
    "Course";

  if (moduleQuery.isLoading || courseQuery.isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  if (moduleQuery.isError || !moduleQuery.data || !moduleProgress) {
    return (
      <ErrorState
        title="Unable to load module"
        description="This module could not be loaded."
        onRetry={() => {
          void moduleQuery.refetch();
        }}
      />
    );
  }

  const module = moduleQuery.data;

  return (
    <div className="space-y-6">
      <Link
        href={getCourseLearningPath(courseId)}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Link>

      <Card className="rounded-2xl border border-slate-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
          {formatModuleLabel(module.displayOrder)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#0B1F3A]">{module.title}</h1>
        {module.description ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {module.description}
          </p>
        ) : null}
        <LearningProgressBar
          value={moduleProgress.percentage}
          label="Module Progress"
          className="mt-5"
        />
        <p className="mt-3 text-sm text-slate-600">
          {moduleProgress.completedLessons} / {moduleProgress.totalLessons} lessons completed
        </p>
      </Card>

      {module.lessons.length === 0 ? (
        <EmptyState
          title="No lessons in this module"
          description="Lessons will appear here once they are added to this module."
        />
      ) : (
        <div className="space-y-3">
          {module.lessons
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((lesson) => {
              const completed = progressMap.get(lesson.id)?.isCompleted ?? false;
              return (
                <Card
                  key={lesson.id}
                  className={cn(
                    "rounded-2xl border p-5",
                    completed ? "border-emerald-100 bg-emerald-50/40" : "border-slate-200",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {formatLessonLabel(lesson.displayOrder)}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-[#0B1F3A]">
                        {lesson.title}
                      </h2>
                      {lesson.duration ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {lesson.duration} min
                        </p>
                      ) : null}
                    </div>
                    <Badge variant={completed ? "success" : "default"}>
                      {completed ? "Completed" : "Not Completed"}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Link href={getLessonLearningPath(courseId, lesson.id)}>
                      <Button size="sm" className="rounded-xl">
                        Open Lesson
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
