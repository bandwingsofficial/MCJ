"use client";

import { useState } from "react";

import { courseLearnItemService } from "@/src/features/course-learn-items/services/course-learn-item.service";
import type { CreateCourseLearnItemRequest } from "@/src/features/course-learn-items/types";

interface UseCreateCourseLearnItemReturn {
  createCourseLearnItem: (
    payload: CreateCourseLearnItemRequest,
    imageFile?: File | null,
  ) => Promise<void>;
  isLoading: boolean;
}

export function useCreateCourseLearnItem(): UseCreateCourseLearnItemReturn {
  const [isLoading, setIsLoading] = useState(false);

  const createCourseLearnItem = async (
    payload: CreateCourseLearnItemRequest,
    imageFile?: File | null,
  ) => {
    try {
      setIsLoading(true);

      const requestPayload: CreateCourseLearnItemRequest = { ...payload };

      if (imageFile) {
        const uploadResponse =
          await courseLearnItemService.uploadLearnItemImage(imageFile);
        requestPayload.imageUrl = uploadResponse.data.url;
      }

      await courseLearnItemService.createCourseLearnItem(requestPayload);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCourseLearnItem,
    isLoading,
  };
}
