"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import type { CourseSummary } from "@/src/features/courses/types/course.types";

export function useCourseSummary(courseId?: string) {
  const [summary, setSummary] =
    useState<CourseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setSummary(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response =
        await courseService.getCourseSummary(courseId);
      setSummary(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load course summary",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { summary, isLoading, error, refetch };
}
