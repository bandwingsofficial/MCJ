"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  ClipboardList,
  XCircle,
} from "lucide-react";

import { LearningConfirmDialog } from "@/src/features/learning/components/modals/learning-confirm-dialog";
import { LearningModalShell } from "@/src/features/learning/components/modals/learning-modal-shell";
import {
  QuizCopyGuard,
  QuizSubmitDialog,
  QuizTabWarning,
} from "@/src/features/learning/components/quiz/quiz-integrity";
import { QuizSummary } from "@/src/features/learning/components/quiz/quiz-summary";
import { QuizTimer } from "@/src/features/learning/components/quiz/quiz-timer";
import {
  useSubmitLessonQuiz,
  useValidateLessonQuizAnswer,
} from "@/src/features/learning/hooks/use-learning-mutations";
import { useStudentLessonQuiz } from "@/src/features/learning/hooks/use-learning-queries";
import type {
  StudentQuizQuestionDto,
  StudentQuizSubmitResultDto,
} from "@/src/features/learning/types/learning.types";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

type QuestionAnswerState = {
  selectedOptionIds: string[];
  submitted: boolean;
  correct?: boolean;
  correctOptionIds?: string[];
  explanation?: string | null;
};

type QuizView = "intro" | "active" | "summary" | "completed";

interface LessonQuizModalProps {
  open: boolean;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

const MAX_TAB_SWITCHES = 3;

export function LessonQuizModal({
  open,
  courseId,
  lessonId,
  lessonTitle,
  onClose,
}: LessonQuizModalProps) {
  const quizQuery = useStudentLessonQuiz(courseId, lessonId, {
    enabled: open,
  });
  const validateMutation = useValidateLessonQuizAnswer(courseId, lessonId);
  const submitMutation = useSubmitLessonQuiz(courseId, lessonId);

  const [view, setView] = useState<QuizView>("intro");
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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const finishInProgressRef = useRef(false);
  const quizStartedAtRef = useRef<number | null>(null);
  const questionStatesRef = useRef(questionStates);
  const tabSwitchCountRef = useRef(0);
  const isAwayRef = useRef(false);
  const initializedForOpenRef = useRef(false);

  questionStatesRef.current = questionStates;

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
    if (!open) {
      initializedForOpenRef.current = false;
      return;
    }

    if (initializedForOpenRef.current || quizQuery.isLoading) {
      return;
    }

    if (!quizQuery.data) {
      return;
    }

    initializedForOpenRef.current = true;
    setCurrentIndex(0);
    setQuestionStates({});
    setPendingSelection([]);
    setRemainingSeconds(null);
    setTimeUsedSeconds(null);
    setTimedOut(false);
    setTerminatedByTabSwitch(false);
    setFinalResult(null);
    setShowFinishConfirm(false);
    setShowLeaveConfirm(false);
    setShowTabWarning(false);
    setTabSwitchCount(0);
    tabSwitchCountRef.current = 0;
    quizStartedAtRef.current = null;
    finishInProgressRef.current = false;

    if (quizQuery.data.latestAttempt) {
      setView("completed");
      return;
    }

    setView("intro");
  }, [open, lessonId, quizQuery.isLoading, quizQuery.data]);

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
      if (finishInProgressRef.current || view === "summary") {
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
        setView("summary");
      } finally {
        finishInProgressRef.current = false;
      }
    },
    [buildAnswersPayload, submitMutation, view],
  );

  useEffect(() => {
    if (!open || view !== "active") {
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
  }, [handleFinishQuiz, open, view]);

  useEffect(() => {
    if (view !== "active" || timeLimitSeconds == null) {
      return;
    }

    if (quizStartedAtRef.current == null) {
      quizStartedAtRef.current = Date.now();
      setRemainingSeconds(timeLimitSeconds);
    }
  }, [timeLimitSeconds, view]);

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

  const requestClose = () => {
    if (view === "active") {
      setShowLeaveConfirm(true);
      return;
    }

    onClose();
  };

  const startQuiz = () => {
    setView("active");
    setCurrentIndex(0);
  };

  if (!open) {
    return null;
  }

  const quiz = quizQuery.data;
  const latestAttempt = quiz?.latestAttempt ?? null;

  let body: ReactNode;

  if (quizQuery.isLoading) {
    body = <Skeleton className="h-48 rounded-xl" />;
  } else if (quizQuery.isError || !quiz) {
    body = (
      <ErrorState
        title="Unable to load quiz"
        description="This lesson quiz could not be loaded."
        onRetry={() => {
          void quizQuery.refetch();
        }}
      />
    );
  } else if (view === "completed" && latestAttempt) {
    body = (
      <div className="space-y-4">
        <EmptyState
          title="Quiz already completed"
          description="You have already completed this quiz. Retakes are not allowed."
        />
        <Card className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <p className="text-sm font-semibold text-[#0B1F3A]">{quiz.title}</p>
          <p className="mt-2 text-sm text-slate-600">
            Score: {latestAttempt.percentage}%
          </p>
          <p className="text-sm text-slate-600">
            Result: {latestAttempt.passed ? "Passed" : "Not passed"}
          </p>
        </Card>
        <Button type="button" className="w-full rounded-lg" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  } else if (view === "intro") {
    body =
      orderedQuestions.length === 0 ? (
        <EmptyState
          title="No quiz available"
          description="No quiz available for this lesson."
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1F3A]">{quiz.title}</h3>
            {quiz.description ? (
              <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
            ) : null}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Questions</dt>
              <dd className="font-semibold text-[#0B1F3A]">
                {quiz.questionCount}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Attempts</dt>
              <dd className="font-semibold text-[#0B1F3A]">1</dd>
            </div>
          </dl>
          <p className="text-sm text-slate-600">
            This quiz can only be attempted once.
          </p>
          <Button type="button" className="w-full rounded-lg" onClick={startQuiz}>
            Start Quiz
          </Button>
        </div>
      );
  } else if (view === "summary" && finalResult) {
    body = (
      <div className="space-y-4">
        <QuizSummary
          moduleName="Lesson"
          lessonName={lessonTitle}
          quizName={quiz.title}
          result={finalResult}
          totalQuestions={orderedQuestions.length}
          timeUsedSeconds={timeUsedSeconds}
          timeLimitSeconds={timeLimitSeconds}
          timedOut={timedOut}
          terminatedByTabSwitch={terminatedByTabSwitch}
        />
        <Button
          type="button"
          className="w-full rounded-lg"
          onClick={() => {
            setView("completed");
            onClose();
          }}
        >
          Finish Quiz
        </Button>
      </div>
    );
  } else if (!currentQuestion) {
    body = (
      <EmptyState
        title="No quiz questions"
        description="This quiz does not contain any questions yet."
      />
    );
  } else {
    const orderedOptions = currentQuestion.options
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder);
    const activeState = questionStates[currentQuestion.id];
    const selectedOptionIds = activeState?.selectedOptionIds ?? pendingSelection;
    const correctOptionIds = activeState?.correctOptionIds ?? [];
    const isLastQuestion = currentIndex === orderedQuestions.length - 1;

    body = (
      <>
        {showTabWarning ? (
          <QuizTabWarning
            switchCount={tabSwitchCount}
            maxSwitches={MAX_TAB_SWITCHES}
            onDismiss={() => setShowTabWarning(false)}
          />
        ) : null}

        {timeLimitSeconds != null && remainingSeconds != null ? (
          <div className="mb-4">
            <QuizTimer
              totalSeconds={timeLimitSeconds}
              remainingSeconds={remainingSeconds}
              onTick={handleTimerTick}
              onExpire={handleTimerExpire}
              paused={view !== "active"}
            />
          </div>
        ) : null}

        <QuizCopyGuard active={view === "active"}>
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
                  Question {currentIndex + 1} of {orderedQuestions.length}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[#0B1F3A]">
                  {currentQuestion.questionText}
                </h3>
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
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition",
                      optionClass,
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
                  "mt-4 rounded-lg border px-3 py-2.5 text-sm",
                  activeState?.correct
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800",
                )}
              >
                <p className="font-semibold">
                  {activeState?.correct ? "Correct answer" : "Incorrect answer"}
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
          >
            Previous
          </Button>

          {!isCurrentSubmitted ? (
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
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
              size="sm"
              className="rounded-lg"
              loading={submitMutation.isPending}
              disabled={submitMutation.isPending}
              onClick={() => setShowFinishConfirm(true)}
            >
              Finish Quiz
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
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
      </>
    );
  }

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

      <LearningConfirmDialog
        open={showLeaveConfirm}
        title="Leave Quiz?"
        description="Your quiz attempt is currently in progress."
        cancelLabel="Continue Quiz"
        confirmLabel="Leave Quiz"
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onClose();
        }}
      />

      <LearningModalShell
        open={open}
        title="Quiz"
        onClose={requestClose}
        className="sm:max-w-2xl"
      >
        <div key={lessonId}>{body}</div>
      </LearningModalShell>
    </>
  );
}
