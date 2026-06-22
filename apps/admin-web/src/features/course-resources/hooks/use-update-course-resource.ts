"use client";

import {
  useState,
} from "react";

import {
  courseResourceService,
} from "@/src/features/course-resources/services/course-resource.service";

import type {
  UpdateCourseResourceRequest,
} from "@/src/features/course-resources/types";

interface UseUpdateCourseResourceReturn {
  updateCourseResource: (
    resourceId: string,
    payload: UpdateCourseResourceRequest,
  ) => Promise<void>;

  isLoading: boolean;
}

export function useUpdateCourseResource(): UseUpdateCourseResourceReturn {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const updateCourseResource =
    async (
      resourceId: string,
      payload: UpdateCourseResourceRequest,
    ) => {
      try {
        setIsLoading(true);

        await courseResourceService.updateCourseResource(
          resourceId,
          payload,
        );
      } finally {
        setIsLoading(false);
      }
    };

  return {
    updateCourseResource,
    isLoading,
  };
}