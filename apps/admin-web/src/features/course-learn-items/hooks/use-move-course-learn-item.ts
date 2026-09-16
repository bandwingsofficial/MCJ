"use client";

import { useState } from "react";

import { courseLearnItemService } from "@/src/features/course-learn-items/services/course-learn-item.service";
import type { MoveCourseLearnItemRequest } from "@/src/features/course-learn-items/types";

export function useMoveCourseLearnItem() {
  const [isLoading, setIsLoading] = useState(false);

  const moveCourseLearnItem = async (
    id: string,
    payload: MoveCourseLearnItemRequest,
  ) => {
    try {
      setIsLoading(true);
      await courseLearnItemService.moveCourseLearnItem(id, payload);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    moveCourseLearnItem,
    isLoading,
  };
}
