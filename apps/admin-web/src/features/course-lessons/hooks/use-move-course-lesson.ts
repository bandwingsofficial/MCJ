"use client";

import { useState } from "react";

import {
  courseLessonService,
} from "@/src/features/course-lessons/services/course-lesson.service";

import type {
  CourseLesson,
} from "@/src/features/course-lessons/types";

interface UseMoveCourseLessonReturn {
  moveCourseLesson: (
    id: string,
    newPosition: number,
  ) => Promise<CourseLesson>;

  isLoading: boolean;

  error: string | null;
}

export const useMoveCourseLesson =
  (): UseMoveCourseLessonReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const moveCourseLesson =
      async (
        id: string,
        newPosition: number,
      ) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseLessonService.moveCourseLesson(
              id,
              {
                newPosition,
              },
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to move course lesson.";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      moveCourseLesson,
      isLoading,
      error,
    };
  };