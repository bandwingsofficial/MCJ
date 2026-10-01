"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { LessonActionButtons } from "@/src/features/learning/components/lesson/lesson-action-buttons";
import { LessonTextContent } from "@/src/features/learning/components/lesson/lesson-content-panels";
import { LessonVideoSection } from "@/src/features/learning/components/lesson/lesson-video-section";
import { LearningCourseSidebar } from "@/src/features/learning/components/layout/learning-course-sidebar";
import { LessonLearnModal } from "@/src/features/learning/components/modals/lesson-learn-modal";
import { LessonQuizModal } from "@/src/features/learning/components/modals/lesson-quiz-modal";
import { LessonResourcesModal } from "@/src/features/learning/components/modals/lesson-resources-modal";
import { useLearningModeNavigation } from "@/src/features/learning/hooks/use-learning-mode-navigation";
import {
  useMarkLessonComplete,
  useUpdateWatchedSeconds,
} from "@/src/features/learning/hooks/use-learning-mutations";
import {
  useStudentCourse,
  useStudentLesson,
  useStudentLessonQuiz,
} from "@/src/features/learning/hooks/use-learning-queries";
import {
  getVideoSelectionForLesson,
  resolveActivePlayableVideo,
} from "@/src/features/learning/utils/learning-mode-navigation.utils";
import {
  buildProgressMap,
  getLessonNavigation,
} from "@/src/features/learning/utils/progress.utils";
import { getLessonLearningPath } from "@/src/features/learning/utils/routes.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

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
  const watchedMutation = useUpdateWatchedSeconds(courseId, lessonId);

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const modules = courseQuery.data?.course.modules ?? [];
  const progressMap = useMemo(
    () => buildProgressMap(courseQuery.data?.progress.items ?? []),
    [courseQuery.data?.progress.items],
  );

  const canAccessLiveRecorded =
    courseQuery.data?.learningAccess?.canAccessLiveRecorded ?? false;

  const modeNavigation = useLearningModeNavigation({
    courseId,
    urlLessonId: lessonId,
    modules,
    progressMap,
    canAccessLiveRecorded,
  });

  const {
    activeMode,
    openMode,
    selectedLessonByMode,
    expandedModuleByMode,
    videoSelectionByLesson,
    toggleOpenMode,
    toggleModule,
    selectLesson,
    navigateLessonVideo,
  } = modeNavigation;

  const lesson = lessonQuery.data?.lesson;
  const publishedQuiz = lesson ? getPublishedQuiz(lesson) : null;
  const quizQuery = useStudentLessonQuiz(courseId, lessonId, {
    enabled: Boolean(publishedQuiz),
  });

  const navigation = useMemo(
    () => getLessonNavigation(modules, lessonId),
    [modules, lessonId],
  );

  const videoSelection = useMemo(
    () =>
      getVideoSelectionForLesson(
        videoSelectionByLesson,
        activeMode,
        lessonId,
      ),
    [videoSelectionByLesson, activeMode, lessonId],
  );

  const playableVideoState = useMemo(() => {
    if (!lesson) {
      return {
        videos: [],
        current: null,
        currentIndex: 0,
      };
    }

    return resolveActivePlayableVideo(lesson, activeMode, videoSelection);
  }, [lesson, activeMode, videoSelection]);

  if (lessonQuery.isLoading || courseQuery.isLoading) {
    return <Skeleton className="h-[520px] rounded-xl" />;
  }

  if (courseQuery.isError || (!courseQuery.isLoading && !courseQuery.data)) {
    return (
      <ErrorState
        title="Unable to load course"
        description={getErrorMessage(courseQuery.error)}
        onRetry={() => {
          void courseQuery.refetch();
        }}
      />
    );
  }

  if (lessonQuery.isError || !lessonQuery.data || !lesson) {
    return (
      <ErrorState
        title="Unable to load lesson"
        description={getErrorMessage(lessonQuery.error)}
        onRetry={() => {
          void lessonQuery.refetch();
          void courseQuery.refetch();
        }}
      />
    );
  }

  const coursePayload = courseQuery.data!;
  const learningAccess = coursePayload.learningAccess;
  const { progress } = lessonQuery.data;
  const isLessonCompleted = progress?.isCompleted ?? false;
  const learnItems = lesson.learnItems ?? [];
  const hasLearnItems = learnItems.length > 0;
  const hasQuiz = Boolean(publishedQuiz);
  const latestAttempt = quizQuery.data?.latestAttempt ?? null;
  const quizCompleted = Boolean(latestAttempt);

  const closeModals = () => {
    setResourcesOpen(false);
    setLearnOpen(false);
    setQuizOpen(false);
  };

  return (
    <div className="space-y-5 pb-28">
      <Link
        href="/student/learning"
        className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Learning
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:items-start">
        {learningAccess ? (
          <LearningCourseSidebar
            courseId={courseId}
            courseTitle={coursePayload.course.title}
            modules={modules}
            progressMap={progressMap}
            learningAccess={learningAccess}
            activeMode={activeMode}
            openMode={openMode}
            selectedLessonByMode={selectedLessonByMode}
            expandedModuleByMode={expandedModuleByMode}
            onToggleOpenMode={toggleOpenMode}
            onToggleModule={toggleModule}
            onSelectLesson={selectLesson}
          />
        ) : null}

        <div className="min-w-0 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#0B1F3A]">{lesson.title}</h2>
            {isLessonCompleted ? (
              <Badge variant="success" className="mt-2">
                Lesson completed
              </Badge>
            ) : null}
          </div>

          <LessonVideoSection
            mode={activeMode}
            videos={playableVideoState.videos}
            currentVideo={playableVideoState.current}
            currentIndex={playableVideoState.currentIndex}
            watchedSeconds={progress?.watchedSeconds ?? 0}
            onTimeUpdate={(seconds) => {
              if (seconds > 0 && seconds % 10 === 0) {
                watchedMutation.mutate(seconds);
              }
            }}
            onPreviousVideo={() => {
              navigateLessonVideo(
                activeMode,
                lessonId,
                "previous",
                playableVideoState.videos.length,
                playableVideoState.currentIndex,
                playableVideoState.videos,
              );
            }}
            onNextVideo={() => {
              navigateLessonVideo(
                activeMode,
                lessonId,
                "next",
                playableVideoState.videos.length,
                playableVideoState.currentIndex,
                playableVideoState.videos,
              );
            }}
          />

          <LessonTextContent
            description={lesson.description}
            contentType={lesson.contentType}
            hideEmptyState
          />

          <LessonActionButtons
            canAccessResources={learningAccess?.canAccessResources ?? true}
            canAccessQuizzes={learningAccess?.canAccessQuizzes ?? true}
            hasLearn={hasLearnItems}
            hasQuiz={hasQuiz}
            quizCompleted={quizCompleted}
            onResources={() => {
              closeModals();
              setResourcesOpen(true);
            }}
            onLearn={() => {
              closeModals();
              setLearnOpen(true);
            }}
            onQuiz={() => {
              closeModals();
              setQuizOpen(true);
            }}
          />
        </div>
      </div>

      <LessonResourcesModal
        open={resourcesOpen}
        lessonId={lessonId}
        courseId={courseId}
        resources={lesson.resources}
        onClose={() => setResourcesOpen(false)}
      />

      <LessonLearnModal
        open={learnOpen}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        learnItems={learnItems}
        onClose={() => setLearnOpen(false)}
      />

      <LessonQuizModal
        open={quizOpen}
        courseId={courseId}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        onClose={() => {
          setQuizOpen(false);
        }}
      />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {navigation.previous ? (
            <Link
              href={getLessonLearningPath(
                courseId,
                navigation.previous.id,
                activeMode,
              )}
            >
              <Button variant="outline" size="sm" className="rounded-lg">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            </Link>
          ) : (
            <span className="w-20" />
          )}

          <Button
            size="sm"
            className="rounded-lg"
            loading={completeMutation.isPending}
            disabled={isLessonCompleted}
            onClick={() => completeMutation.mutate()}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            {isLessonCompleted ? "Completed" : "Mark Complete"}
          </Button>

          {navigation.next ? (
            <Link
              href={getLessonLearningPath(
                courseId,
                navigation.next.id,
                activeMode,
              )}
            >
              <Button size="sm" className="rounded-lg">
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <span className="w-20" />
          )}
        </div>
      </div>
    </div>
  );
}
