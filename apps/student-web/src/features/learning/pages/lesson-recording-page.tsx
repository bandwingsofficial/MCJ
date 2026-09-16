"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";

import { LessonVideoPlayer } from "@/src/features/learning/components/lesson/lesson-content-panels";
import { useUpdateWatchedSeconds } from "@/src/features/learning/hooks/use-learning-mutations";
import {
  useStudentCourse,
  useStudentLesson,
} from "@/src/features/learning/hooks/use-learning-queries";
import {
  formatLessonOrdinal,
  formatModuleOrdinal,
  getLessonOrdinal,
  getModuleOrdinal,
} from "@/src/features/learning/utils/course-hierarchy.utils";
import { findModuleForLesson } from "@/src/features/learning/utils/progress.utils";
import {
  getCourseLearningPath,
  getLessonLearningPath,
} from "@/src/features/learning/utils/routes.utils";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface LessonRecordingPageProps {
  courseId: string;
  lessonId: string;
}

export function LessonRecordingPage({
  courseId,
  lessonId,
}: LessonRecordingPageProps) {
  const lessonQuery = useStudentLesson(courseId, lessonId);
  const courseQuery = useStudentCourse(courseId);
  const watchedMutation = useUpdateWatchedSeconds(courseId, lessonId);

  const module = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    return findModuleForLesson(modules, lessonId);
  }, [courseQuery.data?.course.modules, lessonId]);

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

  if (lessonQuery.isError || !lessonQuery.data) {
    return (
      <ErrorState
        title="Unable to load recording"
        description="This lesson recording could not be loaded."
        onRetry={() => {
          void lessonQuery.refetch();
        }}
      />
    );
  }

  const { lesson, progress } = lessonQuery.data;
  const courseTitle = courseQuery.data?.course.title ?? "Course";
  const backLessonId = lesson.parentLessonId ?? lessonId;
  const hasVideo = Boolean(lesson.videoUrl);

  if (!hasVideo) {
    return (
      <ErrorState
        title="No recording available"
        description="This lesson does not include a recorded video."
        onRetry={() => {
          void lessonQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-3">
        <Link
          href={getLessonLearningPath(courseId, backLessonId)}
          className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lesson
        </Link>

        <div className="border-b border-slate-100 pb-4">
          <p className="text-xs font-medium text-slate-500">{courseTitle}</p>
          {module && moduleLabel ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              {moduleLabel} · {module.title}
            </p>
          ) : null}
          {lessonLabel ? (
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
              {lessonLabel} · Recorded Video
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-bold text-[#0B1F3A]">
            {lesson.title}
          </h1>
          {lesson.description ? (
            <p className="mt-2 text-sm text-slate-600">{lesson.description}</p>
          ) : null}
        </div>
      </div>

      <LessonVideoPlayer
        videoUrl={lesson.videoUrl}
        watchedSeconds={progress?.watchedSeconds ?? 0}
        onTimeUpdate={(seconds) => {
          if (seconds > 0 && seconds % 10 === 0) {
            watchedMutation.mutate(seconds);
          }
        }}
      />

      <p className="text-center text-sm text-slate-500">
        <Link
          href={getCourseLearningPath(courseId)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          View full syllabus
        </Link>
      </p>
    </div>
  );
}
