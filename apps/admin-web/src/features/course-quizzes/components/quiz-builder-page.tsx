"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseLesson } from "@/src/features/course-lessons/types";

import { QuizBuilder } from "@/src/features/course-quizzes/components/quiz-builder";
import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";
import {
  useCourseQuiz,
  useCreateCourseQuiz,
} from "@/src/features/course-quizzes/hooks";

interface QuizBuilderPageProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export function QuizBuilderPage({
  courseId,
  moduleId,
  lessonId,
}: QuizBuilderPageProps) {
  const [quizId, setQuizId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);

  const { quiz, isLoading, error, refetch } = useCourseQuiz(quizId);
  const { createCourseQuiz, isLoading: isCreatingQuiz } = useCreateCourseQuiz();

  const loadLesson = useCallback(async () => {
    try {
      const response = await courseLessonService.getCourseLessons({
        moduleId,
        includeDeleted: false,
      });
      const foundLesson = response.data.find((item) => item.id === lessonId);
      setLesson(foundLesson ?? null);
    } catch {
      setLesson(null);
    }
  }, [lessonId, moduleId]);

  const resolveQuiz = useCallback(async () => {
    setInitializing(true);
    setInitError(null);

    try {
      await loadLesson();

      const listResponse = await courseQuizService.getCourseQuizzes({
        lessonId,
        includeDeleted: false,
      });

      const existingQuiz = listResponse.data[0];

      if (existingQuiz) {
        setQuizId(existingQuiz.id);
        return;
      }

      setQuizId(null);
    } catch (resolveError) {
      setInitError(getErrorMessage(resolveError));
    } finally {
      setInitializing(false);
    }
  }, [lessonId, loadLesson]);

  useEffect(() => {
    void resolveQuiz();
  }, [resolveQuiz]);

  const handleCreateQuiz = async () => {
    try {
      const created = await createCourseQuiz({
        lessonId,
        title: lesson?.title ?? "New Quiz",
        description: lesson?.description ?? undefined,
      });
      setQuizId(created.id);
      appToast.success("Quiz created");
    } catch (createError) {
      appToast.error(getErrorMessage(createError));
    }
  };

  if (initializing || (quizId && isLoading && !quiz)) {
    return <Loader />;
  }

  if (initError) {
    return (
      <ErrorState
        title="Failed To Load Quiz"
        description={initError}
        onRetry={() => {
          void resolveQuiz();
        }}
      />
    );
  }

  if (!quizId) {
    return (
      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link
            href="/courses"
            className="font-medium text-[#2447A8] hover:underline"
          >
            Courses
          </Link>
          <span aria-hidden>›</span>
          <Link
            href={`/courses/${courseId}/manage`}
            className="font-medium text-[#2447A8] hover:underline"
          >
            Management
          </Link>
          <span aria-hidden>›</span>
          <Link
            href={`/courses/${courseId}/manage/modules/${moduleId}`}
            className="font-medium text-[#2447A8] hover:underline"
          >
            Module
          </Link>
          <span aria-hidden>›</span>
          <span className="font-medium text-slate-700">Quiz Builder</span>
        </nav>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">
            No quiz exists for this lesson yet.
          </p>
          <Button
            type="button"
            className="mt-4"
            disabled={isCreatingQuiz}
            onClick={() => {
              void handleCreateQuiz();
            }}
          >
            Create Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <ErrorState
        title="Failed To Load Quiz"
        description={error ?? "Unable to load quiz details."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/courses"
          className="font-medium text-[#2447A8] hover:underline"
        >
          Courses
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/courses/${courseId}/manage`}
          className="font-medium text-[#2447A8] hover:underline"
        >
          Management
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/courses/${courseId}/manage/modules/${moduleId}`}
          className="font-medium text-[#2447A8] hover:underline"
        >
          Module
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">Quiz Builder</span>
      </nav>

      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          {lesson?.title ?? quiz.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Build and publish the quiz for this lesson.
        </p>
      </div>

      <QuizBuilder
        quiz={quiz}
        onQuizUpdated={refetch}
      />
    </div>
  );
}
