"use client";

import { useState } from "react";
import { courseService } from "@/src/features/courses/services/course.service";
import {
  ActivateCourseResponse,
} from "@/src/features/courses/types/course.types";

interface UseActivateCourseReturn {
  activateCourse: (
    id: string
  ) => Promise<ActivateCourseResponse>;

  isLoading: boolean;

  error: string | null;
}

export const useActivateCourse =
  (): UseActivateCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const activateCourse =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.activateCourse(
              id
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to activate course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      activateCourse,
      isLoading,
      error,
    };
  };