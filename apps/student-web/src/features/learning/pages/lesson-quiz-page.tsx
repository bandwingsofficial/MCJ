"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  XCircle,
} from "lucide-react";

import { QuizSummary } from "@/src/features/learning/components/quiz/quiz-summary";
import {
  QuizCopyGuard,
  QuizSubmitDialog,
  QuizTabWarning,
} from "@/src/features/learning/components/quiz/quiz-integrity";
import { QuizTimer } from "@/src/features/learning/components/quiz/quiz-timer";
import {
  useSubmitLessonQuiz,
  useValidateLessonQuizAnswer,
} from "@/src/features/learning/hooks/use-learning-mutations";
import {
  useStudentCourse,
  useStudentLessonQuiz,
} from "@/src/features/learning/hooks/use-learning-queries";
import type {
  StudentQuizQuestionDto,
  StudentQuizSubmitResultDto,
} from "@/src/features/learning/types/learning.types";
import {
  formatLessonOrdinal,
  formatModuleOrdinal,
  getLessonOrdinal,
  getModuleOrdinal,
} from "@/src/features/learning/utils/course-hierarchy.utils";
import { findModuleForLesson } from "@/src/features/learning/utils/progress.utils";
import { getLessonLearningPath } from "@/src/features/learning/utils/routes.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface LessonQuizPageProps {
  courseId: string;
  lessonId: string;
}

type QuestionAnswerState = {
  selectedOptionIds: string[];
  submitted: boolean;
  correct?: boolean;
  correctOptionIds?: string[];
  explanation?: string | null;
};

type QuizPhase = "active" | "summary";

const MAX_TAB_SWITCHES = 3;

export function LessonQuizPage({ courseId, lessonId }: LessonQuizPageProps) {
  const quizQuery = useStudentLessonQuiz(courseId, lessonId);
  const courseQuery = useStudentCourse(courseId);
  const validateMutation = useValidateLessonQuizAnswer(courseId, lessonId);
  const submitMutation = useSubmitLessonQuiz(courseId, lessonId);

  const [phase, setPhase] = useState<QuizPhase>("active");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<
    Record<string, QuestionAnswerState>
  >({});
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [terminatedByTabSwitch, setTerminatedByTabSwitch] = useState(false);
  const [finalResult, setFinalResult] =
    useState<StudentQuizSubmitResultDto | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const finishInProgressRef = useRef(false);
  const quizStartedAtRef = useRef<number | null>(null);
  const questionStatesRef = useRef(questionStates);
  const tabSwitchCountRef = useRef(0);
  const isAwayRef = useRef(false);

  questionStatesRef.current = questionStates;

  const module = useMemo(() => {
    const modules = courseQuery.data?.course.modules ?? [];
    return findModuleForLesson(modules, lessonId);
  }, [courseQuery.data?.course.modules, lessonId]);

  const lesson = useMemo(() => {
    if (!module) {
      return null;
    }

    return module.lessons.find((item) => item.id === lessonId) ?? null;
  }, [module, lessonId]);

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

  const orderedQuestions = useMemo(() => {
    if (!quizQuery.data) {
      return [];
    }

    return quizQuery.data.questions
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder);
  }, [quizQuery.data]);

  const timeLimitSeconds = useMemo(() => {
    const minutes = quizQuery.data?.timeLimitMinutes;
    return minutes != null && minutes > 0 ? minutes * 60 : null;
  }, [quizQuery.data?.timeLimitMinutes]);

  useEffect(() => {
    if (timeLimitSeconds == null || quizStartedAtRef.current != null) {
      return;
    }

    quizStartedAtRef.current = Date.now();
    setRemainingSeconds(timeLimitSeconds);
  }, [timeLimitSeconds]);

  const buildAnswersPayload = useCallback(
    (states: Record<string, QuestionAnswerState>) =>
      orderedQuestions.map((question) => ({
        questionId: question.id,
        selectedOptionIds: states[question.id]?.selectedOptionIds ?? [],
      })),
    [orderedQuestions],
  );

  const handleFinishQuiz = useCallback(
    async (options?: { expired?: boolean; terminatedByTabSwitch?: boolean }) => {
      if (finishInProgressRef.current || phase === "summary") {
        return;
      }

      finishInProgressRef.current = true;

      if (options?.expired) {
        setTimedOut(true);
      }

      if (options?.terminatedByTabSwitch) {
        setTerminatedByTabSwitch(true);
        tabSwitchCountRef.current = MAX_TAB_SWITCHES;
        setTabSwitchCount(MAX_TAB_SWITCHES);
        setShowTabWarning(false);
      }

      if (quizStartedAtRef.current != null) {
        setTimeUsedSeconds(
          Math.floor((Date.now() - quizStartedAtRef.current) / 1000),
        );
      }

      try {
        const response = await submitMutation.mutateAsync(
          buildAnswersPayload(questionStatesRef.current),
        );
        setFinalResult(response);
        setPhase("summary");
      } finally {
        finishInProgressRef.current = false;
      }
    },
    [buildAnswersPayload, phase, submitMutation],
  );

  useEffect(() => {
    if (phase !== "active") {
      return;
    }

    const handleVisibilityChange = () => {
      if (finishInProgressRef.current) {
        return;
      }

      if (document.hidden) {
        isAwayRef.current = true;
        return;
      }

      if (!isAwayRef.current) {
        return;
      }

      isAwayRef.current = false;

      if (tabSwitchCountRef.current >= MAX_TAB_SWITCHES) {
        return;
      }

      const nextCount = tabSwitchCountRef.current + 1;
      tabSwitchCountRef.current = nextCount;
      setTabSwitchCount(nextCount);

      if (nextCount >= MAX_TAB_SWITCHES) {
        void handleFinishQuiz({ terminatedByTabSwitch: true });
        return;
      }

      setShowTabWarning(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleFinishQuiz, phase]);

  const handleTimerTick = useCallback(() => {
    setRemainingSeconds((current) => {
      if (current == null) {
        return current;
      }

      return Math.max(current - 1, 0);
    });
  }, []);

  const handleTimerExpire = useCallback(() => {
    void handleFinishQuiz({ expired: true });
  }, [handleFinishQuiz]);

  const currentQuestion = orderedQuestions[currentIndex] ?? null;
  const currentState = currentQuestion
    ? questionStates[currentQuestion.id]
    : undefined;
  const isCurrentSubmitted = Boolean(currentState?.submitted);

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    const saved = questionStates[currentQuestion.id];
    setPendingSelection(saved?.selectedOptionIds ?? []);
  }, [currentQuestion, questionStates]);

  const selectOption = (
    question: StudentQuizQuestionDto,
    optionId: string,
  ) => {
    if (isCurrentSubmitted) {
      return;
    }

    setPendingSelection((current) => {
      let nextSelection: string[];

      if (question.type === "MULTIPLE_SELECT") {
        nextSelection = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        nextSelection = [optionId];
      }

      setQuestionStates((states) => ({
        ...states,
        [question.id]: {
          selectedOptionIds: nextSelection,
          submitted: false,
        },
      }));

      return nextSelection;
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || pendingSelection.length === 0 || isCurrentSubmitted) {
      return;
    }

    const validation = await validateMutation.mutateAsync({
      questionId: currentQuestion.id,
      selectedOptionIds: pendingSelection,
    });

    setQuestionStates((states) => ({
      ...states,
      [currentQuestion.id]: {
        selectedOptionIds: pendingSelection,
        submitted: true,
        correct: validation.correct,
        correctOptionIds: validation.correctOptionIds,
        explanation: validation.explanation,
      },
    }));
  };

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
  const moduleName = module
    ? `${moduleLabel ? `${moduleLabel} · ` : ""}${module.title}`
    : "Module";
  const lessonName = lesson?.title ?? "Lesson";

  if (phase === "summary" && finalResult) {
    return (
      <div className="space-y-4 pb-10">
        <Link
          href={getLessonLearningPath(courseId, lessonId)}
          className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lesson
        </Link>

        <QuizSummary
          moduleName={moduleName}
          lessonName={lessonName}
          quizName={quiz.title}
          result={finalResult}
          totalQuestions={orderedQuestions.length}
          timeUsedSeconds={timeUsedSeconds}
          timeLimitSeconds={timeLimitSeconds}
          timedOut={timedOut}
          terminatedByTabSwitch={terminatedByTabSwitch}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <ErrorState
        title="No quiz questions"
        description="This quiz does not contain any questions yet."
        onRetry={() => {
          void quizQuery.refetch();
        }}
      />
    );
  }

  const orderedOptions = currentQuestion.options
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const activeState = questionStates[currentQuestion.id];
  const selectedOptionIds = activeState?.selectedOptionIds ?? pendingSelection;
  const correctOptionIds = activeState?.correctOptionIds ?? [];
  const isLastQuestion = currentIndex === orderedQuestions.length - 1;

  return (
    <>
      <QuizSubmitDialog
        open={showFinishConfirm}
        loading={submitMutation.isPending}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={() => {
          setShowFinishConfirm(false);
          void handleFinishQuiz();
        }}
      />

      <div className="space-y-6 pb-10">
        <div className="space-y-3">
          <Link
            href={getLessonLearningPath(courseId, lessonId)}
            className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lesson
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="min-w-0">
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
              <h1 className="mt-2 text-2xl font-bold text-[#0B1F3A]">
                {quiz.title}
              </h1>
              {quiz.description ? (
                <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
              ) : null}
            </div>

            {timeLimitSeconds != null && remainingSeconds != null ? (
              <QuizTimer
                totalSeconds={timeLimitSeconds}
                remainingSeconds={remainingSeconds}
                onTick={handleTimerTick}
                onExpire={handleTimerExpire}
                paused={phase === "summary"}
              />
            ) : null}
          </div>
        </div>

        {showTabWarning ? (
          <QuizTabWarning
            switchCount={tabSwitchCount}
            maxSwitches={MAX_TAB_SWITCHES}
            onDismiss={() => setShowTabWarning(false)}
          />
        ) : null}

        <QuizCopyGuard active={phase === "active"}>
          <Card className="rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
                    Question {currentIndex + 1} of {orderedQuestions.length}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#0B1F3A]">
                    {currentQuestion.questionText}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {currentQuestion.type.replace(/_/g, " ")} ·{" "}
                    {currentQuestion.points} point
                    {currentQuestion.points === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {orderedOptions.map((option) => {
                const selected = selectedOptionIds.includes(option.id);
                const isCorrectOption = correctOptionIds.includes(option.id);
                const showResult = isCurrentSubmitted;

                let optionClass =
                  "border-slate-200 bg-white text-slate-700 hover:border-slate-300";

                if (showResult) {
                  if (isCorrectOption) {
                    optionClass =
                      "border-emerald-300 bg-emerald-50 text-emerald-900";
                  } else if (selected) {
                    optionClass = "border-rose-300 bg-rose-50 text-rose-900";
                  }
                } else if (selected) {
                  optionClass = "border-violet-300 bg-violet-50 text-[#0B1F3A]";
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isCurrentSubmitted}
                    onClick={() => selectOption(currentQuestion, option.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                      optionClass,
                      isCurrentSubmitted ? "cursor-default" : "",
                    )}
                  >
                    <span>{option.optionText}</span>
                    {showResult && isCorrectOption ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : null}
                    {showResult && selected && !isCorrectOption ? (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {isCurrentSubmitted ? (
              <div
                className={cn(
                  "mt-4 rounded-lg border px-4 py-3 text-sm",
                  activeState?.correct
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800",
                )}
              >
                <p className="font-semibold">
                  {activeState?.correct
                    ? "Correct answer"
                    : "Incorrect answer"}
                </p>
                {activeState?.explanation ? (
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">
                    {activeState.explanation}
                  </p>
                ) : null}
              </div>
            ) : null}
          </Card>
        </QuizCopyGuard>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
          >
            Previous
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            {!isCurrentSubmitted ? (
              <Button
                type="button"
                className="rounded-lg bg-violet-600 hover:bg-violet-700"
                loading={validateMutation.isPending}
                disabled={pendingSelection.length === 0}
                onClick={() => {
                  void handleSubmitAnswer();
                }}
              >
                Submit Answer
              </Button>
            ) : isLastQuestion ? (
              <Button
                type="button"
                className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"
                onClick={() => setShowFinishConfirm(true)}
              >
                Finish Quiz
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-lg bg-violet-600 hover:bg-violet-700"
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(index + 1, orderedQuestions.length - 1),
                  )
                }
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
