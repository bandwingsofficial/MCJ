"use client";

import { useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  PermanentDeleteCourseResponse,
} from "@/src/features/courses/types/course.types";

interface UsePermanentlyDeleteCourseReturn {
  permanentlyDeleteCourse: (
    id: string
  ) => Promise<PermanentDeleteCourseResponse>;

  isLoading: boolean;

  error: string | null;
}

export const usePermanentlyDeleteCourse =
  (): UsePermanentlyDeleteCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const permanentlyDeleteCourse =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.permanentlyDeleteCourse(
              id
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to permanently delete course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      permanentlyDeleteCourse,
      isLoading,
      error,
    };
  };