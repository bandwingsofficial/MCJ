"use client";

import { useState } from "react";

import { courseResourceService } from "@/src/features/course-resources/services/course-resource.service";

interface UsePermanentDeleteCourseResourceReturn {
  permanentDeleteCourseResource: (resourceId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function usePermanentDeleteCourseResource(): UsePermanentDeleteCourseResourceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permanentDeleteCourseResource = async (resourceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await courseResourceService.permanentDeleteCourseResource(resourceId);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to permanently delete resource.";

      setError(message);
      throw deleteError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permanentDeleteCourseResource,
    isLoading,
    error,
  };
}
