"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type {
  CreateCourseQuizRequest,
  CourseQuiz,
} from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseCreateCourseQuizReturn {
  createCourseQuiz: (payload: CreateCourseQuizRequest) => Promise<CourseQuiz>;
  isLoading: boolean;
  error: string | null;
}

export const useCreateCourseQuiz = (): UseCreateCourseQuizReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourseQuiz = async (payload: CreateCourseQuizRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.createCourseQuiz(payload);
      return response.data;
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create course quiz.";

      setError(message);
      throw createError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCourseQuiz,
    isLoading,
    error,
  };
};
