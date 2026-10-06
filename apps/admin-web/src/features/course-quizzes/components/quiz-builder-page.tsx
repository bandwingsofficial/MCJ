"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import {
  courseManageLessonPath,
  courseManageModulePath,
  courseManageModuleTestPath,
  courseManagePath,
} from "@/src/features/courses/utils/course-manage.routes";

import { QuizBuilder } from "@/src/features/course-quizzes/components/quiz-builder";
import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";
import {
  useCourseQuiz,
  useCreateCourseQuiz,
} from "@/src/features/course-quizzes/hooks";

interface QuizBuilderPageProps {
  courseId: string;
  moduleId: string;
  /** Legacy lesson-scoped URL; resolves quiz then redirects to module test URL. */
  lessonId?: string;
  /** Module test builder URL (`.../modules/:moduleId/test/:quizId`). */
  quizId?: string;
}

export function QuizBuilderPage({
  courseId,
  moduleId,
  lessonId: lessonIdProp,
  quizId: quizIdProp,
}: QuizBuilderPageProps) {
  const router = useRouter();
  const { course } = useCourse(courseId);
  const [quizId, setQuizId] = useState<string | null>(quizIdProp ?? null);
  const [lessonId, setLessonId] = useState<string | null>(lessonIdProp ?? null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);

  const { quiz, isLoading, error, refetch } = useCourseQuiz(quizId);
  const { createCourseQuiz, isLoading: isCreatingQuiz } = useCreateCourseQuiz();

  const loadLesson = useCallback(async (id: string) => {
    try {
      const response = await courseLessonService.getCourseLesson(id);
      setLesson(response.data);
    } catch {
      setLesson(null);
    }
  }, []);

  const resolveQuiz = useCallback(async () => {
    setInitializing(true);
    setInitError(null);

    try {
      if (quizIdProp) {
        setQuizId(quizIdProp);
        const detail = await courseQuizService.getCourseQuiz(quizIdProp);
        setLessonId(detail.data.lessonId);
        await loadLesson(detail.data.lessonId);
        return;
      }

      if (!lessonIdProp) {
        setInitError("Missing test or lesson identifier.");
        return;
      }

      await loadLesson(lessonIdProp);

      const listResponse = await courseQuizService.getCourseQuizzes({
        lessonId: lessonIdProp,
        includeDeleted: false,
      });

      const existingQuiz = listResponse.data[0];

      if (existingQuiz) {
        router.replace(
          courseManageModuleTestPath(courseId, moduleId, existingQuiz.id),
        );
        return;
      }

      setQuizId(null);
      setLessonId(lessonIdProp);
    } catch (resolveError) {
      setInitError(getErrorMessage(resolveError));
    } finally {
      setInitializing(false);
    }
  }, [courseId, lessonIdProp, loadLesson, moduleId, quizIdProp, router]);

  useEffect(() => {
    void resolveQuiz();
  }, [resolveQuiz]);

  useEffect(() => {
    if (quiz?.lessonId && quiz.lessonId !== lessonId) {
      setLessonId(quiz.lessonId);
      void loadLesson(quiz.lessonId);
    }
  }, [quiz?.lessonId, lessonId, loadLesson]);

  const handleCreateQuiz = async () => {
    if (!lessonId) {
      return;
    }

    try {
      const created = await createCourseQuiz({
        lessonId,
        title: lesson?.title ?? "New Test",
        description: lesson?.description ?? undefined,
      });
      setQuizId(created.id);
      router.replace(
        courseManageModuleTestPath(courseId, moduleId, created.id),
      );
      appToast.success("Test created");
    } catch (createError) {
      appToast.error(getErrorMessage(createError));
    }
  };

  const isModuleTestRoute = Boolean(quizIdProp ?? quizId);

  const breadcrumbs = (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#647A9B]">
      <Link href="/courses" className="font-medium text-[#2563EB] hover:underline">
        Courses
      </Link>
      <span aria-hidden>›</span>
      <Link
        href={courseManagePath(courseId)}
        className="font-medium text-[#2563EB] hover:underline"
      >
        {course?.title ?? "Course"}
        {course?.slug ? ` (${course.slug})` : ""}
      </Link>
      <span aria-hidden>›</span>
      <span className="text-slate-700">Management</span>
      <span aria-hidden>›</span>
      <Link
        href={courseManagePath(courseId)}
        className="font-medium text-[#2563EB] hover:underline"
      >
        Modules
      </Link>
      <span aria-hidden>›</span>
      <Link
        href={courseManageModulePath(courseId, moduleId)}
        className="font-medium text-[#2563EB] hover:underline"
      >
        Module
      </Link>
      {isModuleTestRoute ? (
        <>
          <span aria-hidden>›</span>
          <span className="text-slate-700">Test</span>
          <span aria-hidden>›</span>
          <span className="font-medium text-[#102A56]">
            {quiz?.title ?? lesson?.title ?? "Test Builder"}
          </span>
        </>
      ) : (
        <>
          <span aria-hidden>›</span>
          <span className="text-slate-700">Lessons</span>
          <span aria-hidden>›</span>
          <Link
            href={
              lessonId
                ? courseManageLessonPath(courseId, moduleId, lessonId)
                : courseManageModulePath(courseId, moduleId)
            }
            className="font-medium text-[#2563EB] hover:underline"
          >
            {lesson?.title ?? "Lesson"}
          </Link>
          <span aria-hidden>›</span>
          <span className="font-medium text-[#102A56]">Test Builder</span>
        </>
      )}
    </nav>
  );

  if (initializing || (quizId && isLoading && !quiz)) {
    return <Loader />;
  }

  if (initError) {
    return (
      <ErrorState
        title="Failed To Load Test"
        description={initError}
        onRetry={() => {
          void resolveQuiz();
        }}
      />
    );
  }

  if (!quizId) {
    return (
      <div className="min-h-full space-y-4">
        {breadcrumbs}

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">
            No test exists for this lesson yet.
          </p>
          <Button
            type="button"
            className="mt-4"
            disabled={isCreatingQuiz || !lessonId}
            onClick={() => {
              void handleCreateQuiz();
            }}
          >
            Create Test
          </Button>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <ErrorState
        title="Failed To Load Test"
        description={error ?? "Unable to load test details."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-full space-y-4">
      {breadcrumbs}

      <div>
        <h1 className="text-xl font-semibold text-[#102A56] sm:text-2xl">
          {quiz.title}
        </h1>
        <p className="mt-1 text-sm text-[#647A9B]">
          Build and publish the test for this module.
        </p>
      </div>

      <QuizBuilder quiz={quiz} onQuizUpdated={refetch} />
    </div>
  );
}
