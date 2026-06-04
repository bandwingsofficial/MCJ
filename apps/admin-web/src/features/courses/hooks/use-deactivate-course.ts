"use client";

import { useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  DeactivateCourseResponse,
} from "@/src/features/courses/types/course.types";

interface UseDeactivateCourseReturn {
  deactivateCourse: (
    id: string
  ) => Promise<DeactivateCourseResponse>;

  isLoading: boolean;

  error: string | null;
}

export const useDeactivateCourse =
  (): UseDeactivateCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const deactivateCourse =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.deactivateCourse(
              id
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to deactivate course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      deactivateCourse,
      isLoading,
      error,
    };
  };