"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import {
  LiveRecordedVideosSection,
  QuizSection,
  RecordedVideosSection,
  ResourcesSection,
} from "@/src/features/learning/components/lesson/lesson-content-cards";
import { LessonLearnSection } from "@/src/features/learning/components/lesson/lesson-learn-section";
import { LessonTextContent } from "@/src/features/learning/components/lesson/lesson-content-panels";
import { LearningProgressBar } from "@/src/features/learning/components/progress/learning-progress-bar";
import { SyllabusModuleAccordion } from "@/src/features/learning/components/syllabus/syllabus-module-accordion";
import { LessonTypeIcon } from "@/src/features/learning/components/syllabus/lesson-type-icon";
import { useMarkLessonComplete } from "@/src/features/learning/hooks/use-learning-mutations";
import {
  useStudentCourse,
  useStudentLesson,
  useStudentLessonQuiz,
} from "@/src/features/learning/hooks/use-learning-queries";
import {
  formatLessonOrdinal,
  formatModuleOrdinal,
  getLessonOrdinal,
  getModuleOrdinal,
} from "@/src/features/learning/utils/course-hierarchy.utils";
import {
  buildProgressMap,
  findModuleForLesson,
  getCourseProgressStats,
  getLessonNavigation,
} from "@/src/features/learning/utils/progress.utils";
import {
  getCourseLearningPath,
  getLessonLearningPath,
} from "@/src/features/learning/utils/routes.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { LessonTreeDto } from "@/src/features/learning/types/learning.types";

interface LessonLearningPageProps {
  courseId: string;
  lessonId: string;
}

function getPublishedQuiz(lesson: LessonTreeDto) {
  return lesson.quiz?.status === "PUBLISHED" ? lesson.quiz : null;
}

export function LessonLearningPage({
  courseId,
  lessonId,
}: LessonLearningPageProps) {
  const lessonQuery = useStudentLesson(courseId, lessonId);
  const courseQuery = useStudentCourse(courseId);
  const completeMutation = useMarkLessonComplete(courseId, lessonId);

  const lesson = lessonQuery.data?.lesson;
  const publishedQuiz = lesson ? getPublishedQuiz(lesson) : null;
  const quizQuery = useStudentLessonQuiz(courseId, lessonId, {
    enabled: Boolean(publishedQuiz),
  });

  const navigation = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    return getLessonNavigation(modules, lessonId);
  }, [courseQuery.data?.course.modules, lessonId]);

  const module = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    return findModuleForLesson(modules, lessonId);
  }, [courseQuery.data?.course.modules, lessonId]);

  const progressMap = useMemo(
    () => buildProgressMap(courseQuery.data?.progress.items ?? []),
    [courseQuery.data?.progress.items],
  );

  const courseStats = useMemo(() => {
    if (!courseQuery.data) {
      return null;
    }

    return getCourseProgressStats(
      courseQuery.data.course.modules,
      courseQuery.data.progress,
    );
  }, [courseQuery.data]);

  const moduleLabel = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    if (!module) {
      return null;
    }

    const ordinal = getModuleOrdinal(modules, module.id);
    return ordinal ? formatModuleOrdinal(ordinal) : null;
  }, [courseQuery.data?.course.modules, module]);

  const lessonLabel = useMemo(() => {
    if (!module) {
      return null;
    }

    const ordinal = getLessonOrdinal(module, lessonId);
    return ordinal ? formatLessonOrdinal(ordinal) : null;
  }, [module, lessonId]);

  if (lessonQuery.isLoading || courseQuery.isLoading) {
    return <Skeleton className="h-[520px] rounded-xl" />;
  }

  if (lessonQuery.isError || !lessonQuery.data || !lesson) {
    return (
      <ErrorState
        title="Unable to load lesson"
        description="This lesson could not be loaded."
        onRetry={() => {
          void lessonQuery.refetch();
        }}
      />
    );
  }

  const { progress } = lessonQuery.data;
  const isCompleted = progress?.isCompleted ?? false;
  const hasLearnItems = (lesson.learnItems ?? []).length > 0;
  const selfPacedVideos = lesson.selfPacedVideos ?? [];
  const liveRecordedVideos = lesson.liveRecordedVideos ?? [];
  const hasRecordedVideo =
    Boolean(lesson.videoUrl) ||
    selfPacedVideos.some((video) => Boolean(video.videoUrl));
  const hasLiveRecordedVideos = liveRecordedVideos.some((video) =>
    Boolean(video.videoUrl),
  );
  const hasResources = lesson.resources.length > 0;
  const hasQuiz = Boolean(publishedQuiz);
  const courseTitle = courseQuery.data?.course.title ?? "Course";
  const latestAttempt = quizQuery.data?.latestAttempt ?? null;

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-3">
        <Link
          href={getCourseLearningPath(courseId)}
          className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Syllabus
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{courseTitle}</p>
            {module && moduleLabel ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                {moduleLabel} · {module.title}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-2">
              <LessonTypeIcon
                contentType={lesson.contentType}
                hasVideo={hasRecordedVideo || hasLiveRecordedVideos}
                hasQuiz={hasQuiz}
              />
              {lessonLabel ? (
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  {lessonLabel} · {lesson.contentType.replace(/_/g, " ")}
                </p>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[#0B1F3A]">
              {lesson.title}
            </h1>
          </div>
          <Badge variant={isCompleted ? "success" : "warning"}>
            {isCompleted ? "Completed" : "In Progress"}
          </Badge>
        </div>
      </div>

      {courseStats ? (
        <Card className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#0B1F3A]">Course Progress</p>
              <p className="text-xs text-slate-500">
                {courseStats.completedLessons}/{courseStats.totalLessons} lessons
                completed
              </p>
            </div>
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {courseStats.percentage}%
            </p>
          </div>
          <LearningProgressBar
            value={courseStats.percentage}
            className="mt-3"
          />
        </Card>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LessonTextContent
            description={lesson.description}
            contentType={lesson.contentType}
            hideEmptyState
          />

          {hasLearnItems ? (
            <LessonLearnSection learnItems={lesson.learnItems ?? []} />
          ) : null}

          {hasRecordedVideo ? (
            <RecordedVideosSection
              courseId={courseId}
              parentLessonId={lessonId}
              parentTitle={lesson.title}
              videoUrl={lesson.videoUrl}
              duration={lesson.duration}
              contentType={lesson.contentType}
              selfPacedVideos={selfPacedVideos}
            />
          ) : null}

          {hasLiveRecordedVideos ? (
            <LiveRecordedVideosSection
              courseId={courseId}
              videos={liveRecordedVideos}
            />
          ) : null}

          {hasResources ? (
            <ResourcesSection resources={lesson.resources} courseId={courseId} />
          ) : null}

          {hasQuiz && publishedQuiz ? (
            <QuizSection
              courseId={courseId}
              lessonId={lessonId}
              quiz={publishedQuiz}
              latestAttempt={
                latestAttempt
                  ? {
                      percentage: latestAttempt.percentage,
                      passed: latestAttempt.passed,
                    }
                  : null
              }
            />
          ) : null}
        </div>

        {courseQuery.data ? (
          <aside className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-[#0B1F3A]">
                Course Syllabus
              </h2>
              <p className="text-sm text-slate-500">
                Your current lesson is highlighted below.
              </p>
            </div>
            <SyllabusModuleAccordion
              courseId={courseId}
              modules={courseQuery.data.course.modules}
              progressMap={progressMap}
              currentLessonId={lessonId}
              expandedModuleId={module?.id ?? null}
              onToggleModule={() => undefined}
              lockExpandedModule
            />
          </aside>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {navigation.previous ? (
            <Link
              href={getLessonLearningPath(courseId, navigation.previous.id)}
            >
              <Button variant="outline" size="sm" className="rounded-lg">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            </Link>
          ) : (
            <span />
          )}

          <Button
            size="sm"
            className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"
            loading={completeMutation.isPending}
            disabled={isCompleted}
            onClick={() => completeMutation.mutate()}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>

          {navigation.next ? (
            <Link href={getLessonLearningPath(courseId, navigation.next.id)}>
              <Button
                size="sm"
                className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"
              >
                Next Lesson
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={getCourseLearningPath(courseId)}>
              <Button variant="outline" size="sm" className="rounded-lg">
                Back to Syllabus
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
