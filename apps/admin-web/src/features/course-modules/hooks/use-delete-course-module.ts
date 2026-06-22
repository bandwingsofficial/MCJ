"use client";

import { useState } from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

interface UseDeleteCourseModuleReturn {
  isSubmitting: boolean;

  error: string | null;

  deleteCourseModule: (
    moduleId: string
  ) => Promise<void>;
}

export const useDeleteCourseModule =
  (): UseDeleteCourseModuleReturn => {
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

    const deleteCourseModule =
      async (
        moduleId: string
      ): Promise<void> => {
        try {
          setIsSubmitting(true);

          setError(null);

          await courseModuleService.deleteCourseModule(
            moduleId
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete course module.";

          setError(message);

          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };

    return {
      isSubmitting,

      error,

      deleteCourseModule,
    };
  };