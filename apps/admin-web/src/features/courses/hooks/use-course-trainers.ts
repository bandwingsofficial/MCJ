"use client";

import { useCallback, useEffect, useState } from "react";

import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseTrainerAssignment } from "@/src/features/courses/types/course.types";

export function useCourseTrainers(courseId: string) {
  const [trainers, setTrainers] = useState<CourseTrainerAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setTrainers([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await courseService.getCourseTrainers(courseId);
      setTrainers(response.data.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load course trainers",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { trainers, isLoading, error, refetch };
}
