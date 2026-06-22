"use client";

import { useState } from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

import type {
  CourseModule,
  MoveCourseModuleRequest,
} from "@/src/features/course-modules/types/course-module.types";

interface UseMoveCourseModuleReturn {
  isSubmitting: boolean;

  error: string | null;

  moveCourseModule: (
    moduleId: string,
    payload: MoveCourseModuleRequest
  ) => Promise<CourseModule>;
}

export const useMoveCourseModule =
  (): UseMoveCourseModuleReturn => {
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

    const moveCourseModule =
      async (
        moduleId: string,
        payload: MoveCourseModuleRequest
      ): Promise<CourseModule> => {
        try {
          setIsSubmitting(true);

          setError(null);

          const response =
            await courseModuleService.moveCourseModule(
              moduleId,
              payload
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to move course module.";

          setError(message);

          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };

    return {
      isSubmitting,

      error,

      moveCourseModule,
    };
  };