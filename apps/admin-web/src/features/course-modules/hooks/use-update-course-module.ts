"use client";

import { useState } from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

import type {
  CourseModule,
  UpdateCourseModuleRequest,
} from "@/src/features/course-modules/types/course-module.types";

interface UseUpdateCourseModuleReturn {
  isSubmitting: boolean;

  error: string | null;

  updateCourseModule: (
    moduleId: string,
    payload: UpdateCourseModuleRequest
  ) => Promise<CourseModule>;
}

export const useUpdateCourseModule =
  (): UseUpdateCourseModuleReturn => {
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

    const updateCourseModule =
      async (
        moduleId: string,
        payload: UpdateCourseModuleRequest
      ): Promise<CourseModule> => {
        try {
          setIsSubmitting(true);

          setError(null);

          const response =
            await courseModuleService.updateCourseModule(
              moduleId,
              payload
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update course module.";

          setError(message);

          throw error;
        } finally {
          setIsSubmitting(false);
        }
      };

    return {
      isSubmitting,

      error,

      updateCourseModule,
    };
  };