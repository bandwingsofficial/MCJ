"use client";

import { useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  CourseDetails,
  UpdateCourseRequest,
} from "@/src/features/courses/types/course.types";

interface UseUpdateCourseReturn {
  updateCourse: (
    id: string,
    payload: UpdateCourseRequest
  ) => Promise<CourseDetails>;

  isLoading: boolean;

  error: string | null;
}

export const useUpdateCourse =
  (): UseUpdateCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const updateCourse =
      async (
        id: string,
        payload: UpdateCourseRequest
      ) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.updateCourse(
              id,
              payload
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      updateCourse,
      isLoading,
      error,
    };
  };