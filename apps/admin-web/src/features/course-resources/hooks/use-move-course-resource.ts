"use client";

import {
  useState,
} from "react";

import {
  courseResourceService,
} from "@/src/features/course-resources/services/course-resource.service";

import type {
  MoveCourseResourceRequest,
} from "@/src/features/course-resources/types";

interface UseMoveCourseResourceReturn {
  moveCourseResource: (
    resourceId: string,
    payload: MoveCourseResourceRequest,
  ) => Promise<void>;

  isLoading: boolean;
}

export function useMoveCourseResource(): UseMoveCourseResourceReturn {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const moveCourseResource =
    async (
      resourceId: string,
      payload: MoveCourseResourceRequest,
    ) => {
      try {
        setIsLoading(true);

        await courseResourceService.moveCourseResource(
          resourceId,
          payload,
        );
      } finally {
        setIsLoading(false);
      }
    };

  return {
    moveCourseResource,
    isLoading,
  };
}