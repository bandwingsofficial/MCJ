"use client";

import { useState } from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

import type {
  CreateCourseModuleRequest,
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface UseCreateCourseModuleReturn {
  isSubmitting: boolean;

  error: string | null;

  createCourseModule: (
    payload: CreateCourseModuleRequest
  ) => Promise<CourseModule>;
}

export const useCreateCourseModule =
  (): UseCreateCourseModuleReturn => {
    const [
      isSubmitting,
      setIsSubmitting,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState<string | null>(
      null
    );

    const createCourseModule =
      async (
        payload: CreateCourseModuleRequest
      ): Promise<CourseModule> => {
        try {
          setIsSubmitting(true);

          setError(null);

          const response =
            await courseModuleService.createCourseModule(
              payload
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create course module.";

          setError(message);

          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };

    return {
      isSubmitting,

      error,

      createCourseModule,
    };
  };