"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type {
  CourseQuizQuestion,
  UpdateQuizQuestionRequest,
} from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseUpdateQuizQuestionReturn {
  updateQuizQuestion: (
    questionId: string,
    payload: UpdateQuizQuestionRequest,
  ) => Promise<CourseQuizQuestion>;
  isLoading: boolean;
  error: string | null;
}

export const useUpdateQuizQuestion = (): UseUpdateQuizQuestionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuizQuestion = async (
    questionId: string,
    payload: UpdateQuizQuestionRequest,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.updateQuizQuestion(
        questionId,
        payload,
      );
      return response.data;
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update quiz question.";

      setError(message);
      throw updateError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateQuizQuestion,
    isLoading,
    error,
  };
};
