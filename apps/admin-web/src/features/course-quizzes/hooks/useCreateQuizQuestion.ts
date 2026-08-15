"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type {
  CreateQuizQuestionRequest,
  CourseQuizQuestion,
} from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseCreateQuizQuestionReturn {
  createQuizQuestion: (
    quizId: string,
    payload: CreateQuizQuestionRequest,
  ) => Promise<CourseQuizQuestion>;
  isLoading: boolean;
  error: string | null;
}

export const useCreateQuizQuestion = (): UseCreateQuizQuestionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuizQuestion = async (
    quizId: string,
    payload: CreateQuizQuestionRequest,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.createQuizQuestion(
        quizId,
        payload,
      );
      return response.data;
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create quiz question.";

      setError(message);
      throw createError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createQuizQuestion,
    isLoading,
    error,
  };
};
