"use client";

import { useState } from "react";

import {
  courseLessonService,
} from "@/src/features/course-lessons/services/course-lesson.service";

import type {
  CreateCourseLessonRequest,
  CourseLesson,
} from "@/src/features/course-lessons/types";

interface UseCreateCourseLessonReturn {
  createCourseLesson: (
    payload: CreateCourseLessonRequest,
  ) => Promise<CourseLesson>;

  isLoading: boolean;

  error: string | null;
}

export const useCreateCourseLesson =
  (): UseCreateCourseLessonReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const createCourseLesson =
      async (
        payload: CreateCourseLessonRequest,
      ) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseLessonService.createCourseLesson(
              payload,
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create course lesson.";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      createCourseLesson,
      isLoading,
      error,
    };
  };