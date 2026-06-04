"use client";

import { useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

interface UseDeleteCourseReturn {
  deleteCourse: (
    id: string
  ) => Promise<void>;

  isLoading: boolean;

  error: string | null;
}

export const useDeleteCourse =
  (): UseDeleteCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const deleteCourse =
      async (id: string) => {
        try {
          setIsLoading(true);

          setError(null);

          await courseService.deleteCourse(
            id
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      deleteCourse,
      isLoading,
      error,
    };
  };