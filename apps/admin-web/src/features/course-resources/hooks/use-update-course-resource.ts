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
    file?: File | null,
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
      file?: File | null,
    ) => {
      try {
        setIsLoading(true);

        const requestPayload: UpdateCourseResourceRequest =
          {
            ...payload,
          };

        if (file) {
          const uploadResponse =
            await courseResourceService.uploadCourseResource(
              file
            );

          requestPayload.fileUrl =
            uploadResponse.data.url;
        }

        await courseResourceService.updateCourseResource(
          resourceId,
          requestPayload,
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