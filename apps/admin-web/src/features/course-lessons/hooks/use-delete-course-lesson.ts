"use client";

import { useState } from "react";

import {
  courseLessonService,
} from "@/src/features/course-lessons/services/course-lesson.service";

interface UseDeleteCourseLessonReturn {
  deleteCourseLesson: (
    id: string,
  ) => Promise<void>;

  isLoading: boolean;

  error: string | null;
}

export const useDeleteCourseLesson =
  (): UseDeleteCourseLessonReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const deleteCourseLesson =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          await courseLessonService.deleteCourseLesson(
            id,
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete course lesson.";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      deleteCourseLesson,
      isLoading,
      error,
    };
  };