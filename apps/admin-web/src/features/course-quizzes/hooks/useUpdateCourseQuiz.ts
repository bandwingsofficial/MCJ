"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type {
  CourseQuiz,
  UpdateCourseQuizRequest,
} from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseUpdateCourseQuizReturn {
  updateCourseQuiz: (
    id: string,
    payload: UpdateCourseQuizRequest,
  ) => Promise<CourseQuiz>;
  isLoading: boolean;
  error: string | null;
}

export const useUpdateCourseQuiz = (): UseUpdateCourseQuizReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCourseQuiz = async (
    id: string,
    payload: UpdateCourseQuizRequest,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.updateCourseQuiz(id, payload);
      return response.data;
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update course quiz.";

      setError(message);
      throw updateError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCourseQuiz,
    isLoading,
    error,
  };
};
