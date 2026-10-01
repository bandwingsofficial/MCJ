"use client";

import { BookOpen, CheckCircle2, ClipboardList, FileText } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

interface LessonActionButtonsProps {
  canAccessResources: boolean;
  canAccessQuizzes: boolean;
  hasLearn: boolean;
  hasQuiz: boolean;
  quizCompleted: boolean;
  onResources: () => void;
  onLearn: () => void;
  onQuiz: () => void;
}

export function LessonActionButtons({
  canAccessResources,
  canAccessQuizzes,
  hasLearn,
  hasQuiz,
  quizCompleted,
  onResources,
  onLearn,
  onQuiz,
}: LessonActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        className={cn("rounded-lg")}
        disabled={!canAccessResources}
        onClick={onResources}
      >
        <FileText className="mr-1.5 h-4 w-4" />
        Resources
      </Button>

      <Button
        type="button"
        size="sm"
        className="rounded-lg"
        disabled={!hasLearn}
        onClick={onLearn}
      >
        <BookOpen className="mr-1.5 h-4 w-4" />
        Learn
      </Button>

      <Button
        type="button"
        size="sm"
        className={cn(
          "rounded-lg",
          quizCompleted &&
            "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
        )}
        variant={quizCompleted ? "outline" : "primary"}
        disabled={!canAccessQuizzes || !hasQuiz}
        onClick={onQuiz}
      >
        {quizCompleted ? (
          <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
        ) : (
          <ClipboardList className="mr-1.5 h-4 w-4" />
        )}
        {quizCompleted ? "Quiz Completed" : "Quiz"}
      </Button>
    </div>
  );
}
