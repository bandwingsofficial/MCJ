"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import {
  LessonResourcesList,
  LessonTextContent,
  LessonVideoPlayer,
} from "@/src/features/learning/components/lesson/lesson-content-panels";
import { LessonTypeIcon } from "@/src/features/learning/components/syllabus/lesson-type-icon";
import {
  useMarkLessonComplete,
  useUpdateWatchedSeconds,
} from "@/src/features/learning/hooks/use-learning-mutations";
import {
  useStudentCourse,
  useStudentLesson,
} from "@/src/features/learning/hooks/use-learning-queries";
import {
  findModuleForLesson,
  formatLessonLabel,
  formatModuleLabel,
  getLessonNavigation,
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

interface LessonLearningPageProps {
  courseId: string;
  lessonId: string;
}

export function LessonLearningPage({
  courseId,
  lessonId,
}: LessonLearningPageProps) {
  const lessonQuery = useStudentLesson(courseId, lessonId);
  const courseQuery = useStudentCourse(courseId);
  const completeMutation = useMarkLessonComplete(courseId, lessonId);
  const watchedMutation = useUpdateWatchedSeconds(courseId, lessonId);

  const navigation = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    return getLessonNavigation(modules, lessonId);
  }, [courseQuery.data?.course.modules, lessonId]);

  const module = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    return findModuleForLesson(modules, lessonId);
  }, [courseQuery.data?.course.modules, lessonId]);

  if (lessonQuery.isLoading || courseQuery.isLoading) {
    return <Skeleton className="h-[520px] rounded-xl" />;
  }

  if (lessonQuery.isError || !lessonQuery.data) {
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

  const { lesson, progress } = lessonQuery.data;
  const isCompleted = progress?.isCompleted ?? false;
  const hasVideo = Boolean(lesson.videoUrl);
  const courseTitle = courseQuery.data?.course.title ?? "Course";

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
            {module ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                {formatModuleLabel(module.displayOrder)} · {module.title}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-2">
              <LessonTypeIcon
                contentType={lesson.contentType}
                hasVideo={hasVideo}
                hasQuiz={Boolean(lesson.quiz)}
              />
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                {formatLessonLabel(lesson.displayOrder)} · {lesson.contentType}
              </p>
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

      {hasVideo ? (
        <LessonVideoPlayer
          videoUrl={lesson.videoUrl}
          watchedSeconds={progress?.watchedSeconds ?? 0}
          onTimeUpdate={(seconds) => {
            if (seconds > 0 && seconds % 10 === 0) {
              watchedMutation.mutate(seconds);
            }
          }}
        />
      ) : (
        <LessonTextContent
          description={lesson.description}
          contentType={lesson.contentType}
        />
      )}

      {hasVideo && lesson.description ? (
        <Card className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-[#0B1F3A]">
            About this topic
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {lesson.description}
          </p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#0B1F3A]">Resources</h2>
        <LessonResourcesList resources={lesson.resources} courseId={courseId} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#0B1F3A]">Quiz / Practice</h2>
        {lesson.quiz ? (
          <Card className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1F3A]">{lesson.quiz.title}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Status: {lesson.quiz.status}
                  {lesson.quiz.passingScore != null
                    ? ` · Passing score: ${lesson.quiz.passingScore}%`
                    : ""}
                  {lesson.quiz.timeLimitMinutes
                    ? ` · Time limit: ${lesson.quiz.timeLimitMinutes} min`
                    : ""}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Quiz attempts are not available in the LMS yet. Contact your
                  trainer if this assessment is required.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No quiz for this topic"
            description="Quizzes attached to this lesson will appear here."
          />
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {navigation.previous ? (
            <Link href={getLessonLearningPath(courseId, navigation.previous.id)}>
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
              <Button size="sm" className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]">
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
