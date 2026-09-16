"use client";

import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Target,
  XCircle,
} from "lucide-react";

import type { StudentQuizSubmitResultDto } from "@/src/features/learning/types/learning.types";
import { formatQuizDuration } from "@/src/features/learning/components/quiz/quiz-timer";
import { LearningProgressBar } from "@/src/features/learning/components/progress/learning-progress-bar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { cn } from "@/src/shared/lib/cn";

interface QuizSummaryProps {
  moduleName: string;
  lessonName: string;
  quizName: string;
  result: StudentQuizSubmitResultDto;
  totalQuestions: number;
  timeUsedSeconds: number | null;
  timeLimitSeconds: number | null;
  timedOut: boolean;
  terminatedByTabSwitch?: boolean;
}

export function QuizSummary({
  moduleName,
  lessonName,
  quizName,
  result,
  totalQuestions,
  timeUsedSeconds,
  timeLimitSeconds,
  timedOut,
  terminatedByTabSwitch = false,
}: QuizSummaryProps) {
  const correctAnswers =
    result.questionResults?.filter((item) => item.correct).length ?? 0;
  const wrongAnswers = Math.max(totalQuestions - correctAnswers, 0);
  const passed = result.passed;

  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className={cn(
          "border-b px-5 py-4",
          passed
            ? "border-emerald-100 bg-gradient-to-r from-emerald-50 to-white"
            : "border-amber-100 bg-gradient-to-r from-amber-50 to-white",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-xl p-2.5",
                passed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              {passed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Quiz Result
              </p>
              <h2 className="text-xl font-bold text-[#0B1F3A]">
                {passed ? "Passed" : "Not Passed"}
              </h2>
            </div>
          </div>
          <Badge variant={passed ? "success" : "warning"} className="text-sm">
            {passed ? "Pass" : "Fail"}
          </Badge>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-end justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">Score</p>
            <p className="text-2xl font-bold text-[#0B1F3A]">
              {result.percentage}%
            </p>
          </div>
          <LearningProgressBar value={result.percentage} />
          <p className="mt-2 text-xs text-slate-500">
            {result.score} / {result.totalPoints} marks obtained
          </p>
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
            <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
            {moduleName}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
            <ClipboardList className="h-3.5 w-3.5 text-violet-600" />
            {lessonName}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#0B1F3A]">{quizName}</p>

        {terminatedByTabSwitch ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            This quiz was terminated because the maximum tab-switch limit (3)
            was reached.
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <MetricChip
            icon={Target}
            label="Questions"
            value={String(totalQuestions)}
            tone="slate"
          />
          <MetricChip
            icon={CheckCircle2}
            label="Correct"
            value={String(correctAnswers)}
            tone="green"
          />
          <MetricChip
            icon={XCircle}
            label="Wrong"
            value={String(wrongAnswers)}
            tone="rose"
          />
          <MetricChip
            icon={Award}
            label="Marks"
            value={`${result.score}/${result.totalPoints}`}
            tone="violet"
          />
          <MetricChip
            icon={Target}
            label="Percentage"
            value={`${result.percentage}%`}
            tone="blue"
          />
          <MetricChip
            icon={passed ? CheckCircle2 : XCircle}
            label="Status"
            value={passed ? "Passed" : "Failed"}
            tone={passed ? "green" : "amber"}
          />
        </div>

        {timeLimitSeconds != null && timeUsedSeconds != null ? (
          <p className="text-xs text-slate-500">
            Time used: {formatQuizDuration(timeUsedSeconds)}
            {timedOut
              ? " · Timer expired"
              : ` · Remaining: ${formatQuizDuration(
                  Math.max(timeLimitSeconds - timeUsedSeconds, 0),
                )}`}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function MetricChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  tone: "slate" | "green" | "rose" | "violet" | "blue" | "amber";
}) {
  const toneClasses = {
    slate: "border-slate-100 bg-slate-50 text-slate-700",
    green: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
    rose: "border-rose-100 bg-rose-50/80 text-rose-800",
    violet: "border-violet-100 bg-violet-50/80 text-violet-800",
    blue: "border-sky-100 bg-sky-50/80 text-sky-800",
    amber: "border-amber-100 bg-amber-50/80 text-amber-800",
  } as const;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        toneClasses[tone],
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {label}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
