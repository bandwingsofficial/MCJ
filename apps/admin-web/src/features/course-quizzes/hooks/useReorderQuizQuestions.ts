"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type { CourseQuizQuestion } from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseReorderQuizQuestionsReturn {
  reorderQuizQuestions: (
    quizId: string,
    questionIds: string[],
  ) => Promise<CourseQuizQuestion[]>;
  isLoading: boolean;
  error: string | null;
}

export const useReorderQuizQuestions = (): UseReorderQuizQuestionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderQuizQuestions = async (
    quizId: string,
    questionIds: string[],
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.reorderQuizQuestions(quizId, {
        questionIds,
      });
      return response.data;
    } catch (reorderError) {
      const message =
        reorderError instanceof Error
          ? reorderError.message
          : "Failed to reorder quiz questions.";

      setError(message);
      throw reorderError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reorderQuizQuestions,
    isLoading,
    error,
  };
};
