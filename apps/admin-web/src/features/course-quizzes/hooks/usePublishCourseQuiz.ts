"use client";

import { useState } from "react";

import { courseQuizService } from "@/src/features/course-quizzes/services/course-quiz.service";

import type { CourseQuiz } from "@/src/features/course-quizzes/types/course-quiz.types";

interface UsePublishCourseQuizReturn {
  publishCourseQuiz: (id: string) => Promise<CourseQuiz>;
  isLoading: boolean;
  error: string | null;
}

export const usePublishCourseQuiz = (): UsePublishCourseQuizReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishCourseQuiz = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courseQuizService.publishCourseQuiz(id);
      return response.data;
    } catch (publishError) {
      const message =
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish course quiz.";

      setError(message);
      throw publishError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    publishCourseQuiz,
    isLoading,
    error,
  };
};
