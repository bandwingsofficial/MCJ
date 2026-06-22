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
    ) => {
      try {
        setIsLoading(true);

        await courseResourceService.createCourseResource(
          payload,
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