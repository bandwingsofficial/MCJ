"use client";



import Link from "next/link";

import { useMemo } from "react";

import {

  ArrowLeft,

  ArrowRight,

  CheckCircle2,

  ClipboardList,

  FileText,

} from "lucide-react";



import {

  LiveRecordedVideosSection,

  QuizSection,

  RecordedVideosSection,

  ResourcesSection,

} from "@/src/features/learning/components/lesson/lesson-content-cards";

import { LessonLearnSection } from "@/src/features/learning/components/lesson/lesson-learn-section";

import {

  LessonTextContent,

  LessonVideoPlayer,

} from "@/src/features/learning/components/lesson/lesson-content-panels";

import { LearningCourseSidebar } from "@/src/features/learning/components/layout/learning-course-sidebar";

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

import { resolveVideoUrlForMode } from "@/src/features/learning/utils/learning-mode-navigation.utils";

import {
  buildProgressMap,
  getLessonNavigation,
} from "@/src/features/learning/utils/progress.utils";

import {

  getLessonLearningPath,

  getLessonQuizPath,

} from "@/src/features/learning/utils/routes.utils";

import { Badge } from "@/src/shared/components/ui/badge";

import { Button } from "@/src/shared/components/ui/button";

import { Card } from "@/src/shared/components/ui/card";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

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

    videoSelectionByMode,

    toggleOpenMode,

    toggleModule,

    selectLesson,

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

  const hasLearnItems = (lesson.learnItems ?? []).length > 0;

  const selfPacedVideos = lesson.selfPacedVideos ?? [];

  const liveRecordedVideos = lesson.liveRecordedVideos ?? [];

  const hasResources = lesson.resources.length > 0;

  const hasQuiz = Boolean(publishedQuiz);

  const latestAttempt = quizQuery.data?.latestAttempt ?? null;

  const primaryVideoUrl = resolveVideoUrlForMode(

    lesson,

    activeMode,

    videoSelectionByMode[activeMode],

  );



  const showExtraSelfPacedList =

    activeMode === "self_paced" &&

    (Boolean(lesson.videoUrl) || selfPacedVideos.length > 1);



  const showExtraLiveList =

    activeMode === "live_recorded" && liveRecordedVideos.length > 1;



  const videoPlayerKey = `${activeMode}-${lessonId}-${videoSelectionByMode[activeMode].index}-${videoSelectionByMode[activeMode].videoId ?? "default"}`;



  return (

    <div className="space-y-6 pb-28">

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



        <div className="min-w-0 space-y-6">

          <div>

            <h2 className="text-xl font-bold text-[#0B1F3A]">{lesson.title}</h2>

            {isLessonCompleted ? (

              <Badge variant="success" className="mt-2">

                Lesson completed

              </Badge>

            ) : null}

          </div>



          {activeMode === "self_paced" ? (

            primaryVideoUrl ? (

              <LessonVideoPlayer

                key={videoPlayerKey}

                videoUrl={primaryVideoUrl}

                watchedSeconds={progress?.watchedSeconds ?? 0}

                onTimeUpdate={(seconds) => {

                  if (seconds > 0 && seconds % 10 === 0) {

                    watchedMutation.mutate(seconds);

                  }

                }}

              />

            ) : (

              <Card className="rounded-xl border border-dashed border-slate-200 p-6">

                <EmptyState

                  title="No self-paced video yet"

                  description="This lesson does not include a self-paced video. You can still review learn items, resources, and quizzes below."

                />

              </Card>

            )

          ) : primaryVideoUrl ? (

            <LessonVideoPlayer

              key={videoPlayerKey}

              videoUrl={primaryVideoUrl}

              watchedSeconds={progress?.watchedSeconds ?? 0}

              onTimeUpdate={(seconds) => {

                if (seconds > 0 && seconds % 10 === 0) {

                  watchedMutation.mutate(seconds);

                }

              }}

            />

          ) : (

            <Card className="rounded-xl border border-dashed border-slate-200 p-6">

              <EmptyState

                title="No recorded video yet"

                description="There is no live recorded video for this lesson in your batch yet."

              />

            </Card>

          )}



          <LessonTextContent

            description={lesson.description}

            contentType={lesson.contentType}

            hideEmptyState

          />



          {hasLearnItems ? (

            <LessonLearnSection learnItems={lesson.learnItems ?? []} />

          ) : null}



          {showExtraSelfPacedList ? (

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



          {showExtraLiveList ? (

            <LiveRecordedVideosSection

              courseId={courseId}

              videos={liveRecordedVideos}

            />

          ) : null}



          {hasResources ? (

            <div id="lesson-resources">

              <ResourcesSection

                resources={lesson.resources}

                courseId={courseId}

              />

            </div>

          ) : null}



          {hasQuiz && publishedQuiz ? (

            <div id="lesson-quiz">

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

            </div>

          ) : null}

        </div>

      </div>



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



          <div className="flex flex-wrap items-center justify-center gap-2">

            {hasResources ? (

              <Button

                type="button"

                variant="outline"

                size="sm"

                className="rounded-lg"

                onClick={() => {

                  document

                    .getElementById("lesson-resources")

                    ?.scrollIntoView({ behavior: "smooth", block: "start" });

                }}

              >

                <FileText className="mr-1 h-4 w-4" />

                Resources

              </Button>

            ) : null}



            {hasQuiz ? (

              <Link href={getLessonQuizPath(courseId, lessonId)}>

                <Button variant="outline" size="sm" className="rounded-lg">

                  <ClipboardList className="mr-1 h-4 w-4" />

                  Quiz

                </Button>

              </Link>

            ) : null}



            <Button

              size="sm"

              className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"

              loading={completeMutation.isPending}

              disabled={isLessonCompleted}

              onClick={() => completeMutation.mutate()}

            >

              <CheckCircle2 className="mr-1 h-4 w-4" />

              {isLessonCompleted ? "Completed" : "Mark Complete"}

            </Button>

          </div>



          {navigation.next ? (

            <Link

              href={getLessonLearningPath(

                courseId,

                navigation.next.id,

                activeMode,

              )}

            >

              <Button

                size="sm"

                className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"

              >

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


