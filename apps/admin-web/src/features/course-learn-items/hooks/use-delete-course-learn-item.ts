"use client";

import { useState } from "react";

import { courseLearnItemService } from "@/src/features/course-learn-items/services/course-learn-item.service";

export function useDeleteCourseLearnItem() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteCourseLearnItem = async (id: string) => {
    try {
      setIsLoading(true);
      await courseLearnItemService.deleteCourseLearnItem(id);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteCourseLearnItem,
    isLoading,
  };
}
