"use client";

import { useCallback, useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

export function useRemoveCourseTrainer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeCourseTrainer = useCallback(
    async (courseId: string, trainerId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await courseService.removeCourseTrainer(courseId, trainerId);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to remove trainer from course";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { removeCourseTrainer, isLoading, error };
}
