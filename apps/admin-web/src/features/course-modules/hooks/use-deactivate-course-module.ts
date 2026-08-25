"use client";

import { useState } from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

interface UseDeactivateCourseModuleReturn {
  isSubmitting: boolean;

  error: string | null;

  deactivateCourseModule: (
    moduleId: string
  ) => Promise<void>;
}

export const useDeactivateCourseModule =
  (): UseDeactivateCourseModuleReturn => {
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

    const deactivateCourseModule =
      async (
        moduleId: string
      ): Promise<void> => {
        try {
          setIsSubmitting(true);

          setError(null);

          await courseModuleService.deactivateCourseModule(
            moduleId
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to deactivate course module.";

          setError(message);

          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };

    return {
      isSubmitting,

      error,

      deactivateCourseModule,
    };
  };
