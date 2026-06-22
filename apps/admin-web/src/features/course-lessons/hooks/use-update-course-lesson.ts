"use client";

import { useState } from "react";

import {
  courseLessonService,
} from "@/src/features/course-lessons/services/course-lesson.service";

import type {
  CourseLesson,
  UpdateCourseLessonRequest,
} from "@/src/features/course-lessons/types";

interface UseUpdateCourseLessonReturn {
  updateCourseLesson: (
    id: string,
    payload: UpdateCourseLessonRequest,
  ) => Promise<CourseLesson>;

  isLoading: boolean;

  error: string | null;
}

export const useUpdateCourseLesson =
  (): UseUpdateCourseLessonReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const updateCourseLesson =
      async (
        id: string,
        payload: UpdateCourseLessonRequest,
      ) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseLessonService.updateCourseLesson(
              id,
              payload,
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update course lesson.";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      updateCourseLesson,
      isLoading,
      error,
    };
  };