"use client";

import {
  useState,
} from "react";

import {
  courseResourceService,
} from "@/src/features/course-resources/services/course-resource.service";

interface UseDeleteCourseResourceReturn {
  deleteCourseResource: (
    resourceId: string,
  ) => Promise<void>;

  isLoading: boolean;
}

export function useDeleteCourseResource(): UseDeleteCourseResourceReturn {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const deleteCourseResource =
    async (
      resourceId: string,
    ) => {
      try {
        setIsLoading(true);

        await courseResourceService.deleteCourseResource(
          resourceId,
        );
      } finally {
        setIsLoading(false);
      }
    };

  return {
    deleteCourseResource,
    isLoading,
  };
}