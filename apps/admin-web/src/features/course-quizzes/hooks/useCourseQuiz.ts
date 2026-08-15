"use client";

import { useCallback, useEffect, useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type { CourseQuizDetail } from "@/src/features/course-quizzes/types/course-quiz.types";

interface UseCourseQuizReturn {
  quiz: CourseQuizDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCourseQuiz = (quizId: string | null): UseCourseQuizReturn => {
  const [quiz, setQuiz] = useState<CourseQuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setQuiz(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.getCourseQuiz(quizId);
      setQuiz(response.data);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch course quiz.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    void fetchQuiz();
  }, [fetchQuiz]);

  return {
    quiz,
    isLoading,
    error,
    refetch: fetchQuiz,
  };
};
