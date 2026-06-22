"use client";

import {
  useState,
} from "react";

import {
  courseResourceService,
} from "@/src/features/course-resources/services/course-resource.service";

interface UseRestoreCourseResourceReturn {
  restoreCourseResource: (
    resourceId: string,
  ) => Promise<void>;

  isLoading: boolean;
}

export function useRestoreCourseResource(): UseRestoreCourseResourceReturn {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const restoreCourseResource =
    async (
      resourceId: string,
    ) => {
      try {
        setIsLoading(true);

        await courseResourceService.restoreCourseResource(
          resourceId,
        );
      } finally {
        setIsLoading(false);
      }
    };

  return {
    restoreCourseResource,
    isLoading,
  };
}