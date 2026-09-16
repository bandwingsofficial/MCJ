"use client";

import { useState } from "react";

import { courseLearnItemService } from "@/src/features/course-learn-items/services/course-learn-item.service";
import type { UpdateCourseLearnItemRequest } from "@/src/features/course-learn-items/types";

interface UseUpdateCourseLearnItemReturn {
  updateCourseLearnItem: (
    id: string,
    payload: UpdateCourseLearnItemRequest,
    imageFile?: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
  isLoading: boolean;
}

export function useUpdateCourseLearnItem(): UseUpdateCourseLearnItemReturn {
  const [isLoading, setIsLoading] = useState(false);

  const updateCourseLearnItem = async (
    id: string,
    payload: UpdateCourseLearnItemRequest,
    imageFile?: File | null,
    removeImage?: boolean,
  ) => {
    try {
      setIsLoading(true);

      const requestPayload: UpdateCourseLearnItemRequest = { ...payload };

      if (removeImage) {
        requestPayload.imageUrl = null;
      } else if (imageFile) {
        const uploadResponse =
          await courseLearnItemService.uploadLearnItemImage(imageFile);
        requestPayload.imageUrl = uploadResponse.data.url;
      }

      await courseLearnItemService.updateCourseLearnItem(id, requestPayload);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateCourseLearnItem,
    isLoading,
  };
}
