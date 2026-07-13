"use client";

import {
  useState,
} from "react";

import {
  courseResourceService,
} from "@/src/features/course-resources/services/course-resource.service";

import type {
  CreateCourseResourceRequest,
} from "@/src/features/course-resources/types";

interface UseCreateCourseResourceReturn {
  createCourseResource: (
    payload: CreateCourseResourceRequest,
    file?: File | null,
  ) => Promise<void>;

  isLoading: boolean;
}

export function useCreateCourseResource(): UseCreateCourseResourceReturn {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const createCourseResource =
    async (
      payload: CreateCourseResourceRequest,
      file?: File | null,
    ) => {
      try {
        setIsLoading(true);

        const requestPayload: CreateCourseResourceRequest =
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

        await courseResourceService.createCourseResource(
          requestPayload
        );
      } finally {
        setIsLoading(false);
      }
    };

  return {
    createCourseResource,
    isLoading,
  };
}