"use client";

import { useState } from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

interface UseRestoreCourseModuleReturn {
  isSubmitting: boolean;

  error: string | null;

  restoreCourseModule: (
    moduleId: string
  ) => Promise<CourseModule>;
}

export const useRestoreCourseModule =
  (): UseRestoreCourseModuleReturn => {
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

    const restoreCourseModule =
      async (
        moduleId: string
      ): Promise<CourseModule> => {
        try {
          setIsSubmitting(true);

          setError(null);

          const response =
            await courseModuleService.restoreCourseModule(
              moduleId
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to restore course module.";

          setError(message);

          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };

    return {
      isSubmitting,

      error,

      restoreCourseModule,
    };
  };