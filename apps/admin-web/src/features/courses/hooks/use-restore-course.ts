"use client";

import { useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  RestoreCourseResponse,
} from "@/src/features/courses/types/course.types";

interface UseRestoreCourseReturn {
  restoreCourse: (
    id: string
  ) => Promise<RestoreCourseResponse>;

  isLoading: boolean;

  error: string | null;
}

export const useRestoreCourse =
  (): UseRestoreCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const restoreCourse =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.restoreCourse(
              id
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to restore course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      restoreCourse,
      isLoading,
      error,
    };
  };