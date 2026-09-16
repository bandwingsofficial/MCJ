"use client";

import { useCallback, useEffect, useState } from "react";

import { courseLearnItemService } from "@/src/features/course-learn-items/services/course-learn-item.service";
import type { CourseLearnItem } from "@/src/features/course-learn-items/types";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export function useCourseLearnItems(lessonId: string) {
  const [items, setItems] = useState<CourseLearnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!lessonId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await courseLearnItemService.getCourseLearnItems({
        lessonId,
      });
      setItems(
        response.data
          .slice()
          .sort((left, right) => left.displayOrder - right.displayOrder),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    items,
    isLoading,
    error,
    refetch,
  };
}
