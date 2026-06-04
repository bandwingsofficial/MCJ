"use client";

import { useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  CreateCourseRequest,
  CourseDetails,
} from "@/src/features/courses/types/course.types";

interface UseCreateCourseReturn {
  createCourse: (
    payload: CreateCourseRequest
  ) => Promise<CourseDetails>;

  isLoading: boolean;

  error: string | null;
}

export const useCreateCourse =
  (): UseCreateCourseReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const createCourse =
      async (
        payload: CreateCourseRequest
      ) => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.createCourse(
              payload
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create course";

          setError(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      createCourse,
      isLoading,
      error,
    };
  };