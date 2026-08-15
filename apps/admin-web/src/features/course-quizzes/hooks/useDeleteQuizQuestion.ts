"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type { CourseQuizQuestion } from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseDeleteQuizQuestionReturn {
  deleteQuizQuestion: (questionId: string) => Promise<CourseQuizQuestion>;
  isLoading: boolean;
  error: string | null;
}

export const useDeleteQuizQuestion = (): UseDeleteQuizQuestionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteQuizQuestion = async (questionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.deleteQuizQuestion(questionId);
      return response.data;
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete quiz question.";

      setError(message);
      throw deleteError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteQuizQuestion,
    isLoading,
    error,
  };
};
