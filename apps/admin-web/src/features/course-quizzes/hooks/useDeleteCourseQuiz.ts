"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type { CourseQuiz } from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseDeleteCourseQuizReturn {
  deleteCourseQuiz: (id: string) => Promise<CourseQuiz>;
  isLoading: boolean;
  error: string | null;
}

export const useDeleteCourseQuiz = (): UseDeleteCourseQuizReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCourseQuiz = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.deleteCourseQuiz(id);
      return response.data;
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete course quiz.";

      setError(message);
      throw deleteError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCourseQuiz,
    isLoading,
    error,
  };
};
