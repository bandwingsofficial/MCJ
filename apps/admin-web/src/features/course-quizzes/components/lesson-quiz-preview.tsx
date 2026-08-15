"use client";

import { useEffect, useState } from "react";

import { HelpCircle } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";
import type { CourseQuiz } from "@/src/features/course-quizzes/types/course-quiz.types";

interface LessonQuizPreviewProps {
  lessonId: string;
}

export function LessonQuizPreview({ lessonId }: LessonQuizPreviewProps) {
  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadQuiz = async () => {
      try {
        const response = await courseQuizService.getCourseQuizzes({
          lessonId,
          includeDeleted: false,
        });

        if (isActive) {
          setQuiz(response.data[0] ?? null);
        }
      } catch {
        if (isActive) {
          setQuiz(null);
        }
      }
    };

    void loadQuiz();

    return () => {
      isActive = false;
    };
  }, [lessonId]);

  if (!quiz) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <HelpCircle className="h-4 w-4 text-emerald-600" />
        <p className="text-sm font-medium text-slate-900">{quiz.title}</p>
        {quiz.status === "PUBLISHED" ? (
          <Badge variant="success">Published</Badge>
        ) : (
          <Badge variant="warning">Draft</Badge>
        )}
      </div>

      {quiz.description ? (
        <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
        {quiz.passingScore !== null ? (
          <span>Passing score: {quiz.passingScore}%</span>
        ) : null}
        {quiz.timeLimitMinutes !== null ? (
          <span>Time limit: {quiz.timeLimitMinutes} min</span>
        ) : null}
      </div>
    </div>
  );
}
