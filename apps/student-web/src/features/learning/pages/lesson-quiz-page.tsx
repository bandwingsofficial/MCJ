"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";

import { useSubmitLessonQuiz } from "@/src/features/learning/hooks/use-learning-mutations";
import {
  useStudentCourse,
  useStudentLessonQuiz,
} from "@/src/features/learning/hooks/use-learning-queries";
import {
  formatLessonOrdinal,
  formatModuleOrdinal,
  getLessonOrdinal,
  getModuleOrdinal,
} from "@/src/features/learning/utils/course-hierarchy.utils";
import { findModuleForLesson } from "@/src/features/learning/utils/progress.utils";
import {
  getLessonLearningPath,
} from "@/src/features/learning/utils/routes.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface LessonQuizPageProps {
  courseId: string;
  lessonId: string;
}

type AnswerMap = Record<string, string[]>;

export function LessonQuizPage({ courseId, lessonId }: LessonQuizPageProps) {
  const quizQuery = useStudentLessonQuiz(courseId, lessonId);
  const courseQuery = useStudentCourse(courseId);
  const submitMutation = useSubmitLessonQuiz(courseId, lessonId);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submittedResult, setSubmittedResult] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

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

  if (quizQuery.isLoading || courseQuery.isLoading) {
    return <Skeleton className="h-[520px] rounded-xl" />;
  }

  if (quizQuery.isError || !quizQuery.data) {
    return (
      <ErrorState
        title="Unable to load quiz"
        description="This lesson quiz could not be loaded."
        onRetry={() => {
          void quizQuery.refetch();
        }}
      />
    );
  }

  const quiz = quizQuery.data;
  const courseTitle = courseQuery.data?.course.title ?? "Course";
  const result = submittedResult ?? quiz.latestAttempt;
  const isSubmitted = Boolean(result);

  const orderedQuestions = quiz.questions
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder);

  const toggleOption = (questionId: string, optionId: string, type: string) => {
    setAnswers((current) => {
      const selected = current[questionId] ?? [];

      if (type === "MULTIPLE_SELECT") {
        const exists = selected.includes(optionId);
        return {
          ...current,
          [questionId]: exists
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId],
        };
      }

      return {
        ...current,
        [questionId]: [optionId],
      };
    });
  };

  const handleSubmit = async () => {
    const payload = orderedQuestions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: answers[question.id] ?? [],
    }));

    const response = await submitMutation.mutateAsync(payload);
    setSubmittedResult({
      score: response.score,
      totalPoints: response.totalPoints,
      percentage: response.percentage,
      passed: response.passed,
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-3">
        <Link
          href={getLessonLearningPath(courseId, lessonId)}
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
              {lessonLabel} · Quiz / Practice
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0B1F3A]">{quiz.title}</h1>
            {result ? (
              <Badge variant={result.passed ? "success" : "warning"}>
                {result.passed ? "Passed" : "Attempted"} · {result.percentage}%
              </Badge>
            ) : null}
          </div>
          {quiz.description ? (
            <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-slate-500">
            {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"}
            {quiz.passingScore != null
              ? ` · Passing score: ${quiz.passingScore}%`
              : ""}
            {quiz.timeLimitMinutes
              ? ` · Time limit: ${quiz.timeLimitMinutes} min`
              : ""}
          </p>
        </div>
      </div>

      {isSubmitted && result ? (
        <Card className="rounded-xl border border-violet-100 bg-violet-50/60 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className={cn(
                "mt-0.5 h-5 w-5",
                result.passed ? "text-emerald-600" : "text-amber-600",
              )}
            />
            <div>
              <h2 className="font-semibold text-[#0B1F3A]">Quiz Result</h2>
              <p className="mt-1 text-sm text-slate-600">
                Score: {result.score}/{result.totalPoints} ({result.percentage}%)
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {result.passed
                  ? "You passed this quiz."
                  : "You did not reach the passing score. Review the lesson and try again."}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="space-y-4">
        {orderedQuestions.map((question, index) => {
          const selectedOptionIds = answers[question.id] ?? [];
          const orderedOptions = question.options
            .slice()
            .sort((left, right) => left.displayOrder - right.displayOrder);

          return (
            <Card
              key={question.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Question {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold text-[#0B1F3A]">
                    {question.questionText}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {question.type.replace(/_/g, " ")} · {question.points}{" "}
                    point{question.points === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {orderedOptions.map((option) => {
                  const selected = selectedOptionIds.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() =>
                        toggleOption(
                          question.id,
                          option.id,
                          question.type,
                        )
                      }
                      className={cn(
                        "flex w-full items-center rounded-lg border px-4 py-3 text-left text-sm transition",
                        selected
                          ? "border-violet-300 bg-violet-50 text-[#0B1F3A]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                        isSubmitted ? "cursor-default opacity-80" : "",
                      )}
                    >
                      {option.optionText}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={getLessonLearningPath(courseId, lessonId)}>
          <Button variant="outline" className="rounded-lg">
            Back to Lesson
          </Button>
        </Link>

        {!isSubmitted ? (
          <Button
            className="rounded-lg bg-violet-600 hover:bg-violet-700"
            loading={submitMutation.isPending}
            onClick={() => {
              void handleSubmit();
            }}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            className="rounded-lg bg-violet-600 hover:bg-violet-700"
            onClick={() => {
              setSubmittedResult(null);
              setAnswers({});
            }}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
