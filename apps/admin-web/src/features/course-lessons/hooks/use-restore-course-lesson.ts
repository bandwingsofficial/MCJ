"use client";

import { useState } from "react";

import {
  courseLessonService,
} from "@/src/features/course-lessons/services/course-lesson.service";

import type {
  CourseLesson,
} from "@/src/features/course-lessons/types";

interface UseRestoreCourseLessonReturn {
  restoreCourseLesson: (
    id: string,
  ) => Promise<CourseLesson>;

  isLoading: boolean;

  error: string | null;
}

export const useRestoreCourseLesson =
  (): UseRestoreCourseLessonReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const restoreCourseLesson =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseLessonService.restoreCourseLesson(
              id,
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to restore course lesson.";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      restoreCourseLesson,
      isLoading,
      error,
    };
  };