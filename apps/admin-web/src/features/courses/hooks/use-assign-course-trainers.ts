"use client";

import { useCallback, useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";

export function useAssignCourseTrainers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCourseTrainers = useCallback(
    async (courseId: string, trainerIds: string[]) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await courseService.assignCourseTrainers(
          courseId,
          trainerIds,
        );
        return response.data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to assign trainers";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { assignCourseTrainers, isLoading, error };
}
