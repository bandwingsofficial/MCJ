"use client";

import { useState } from "react";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";

import type { CourseLesson } from "@/src/features/course-lessons/types";

interface UseSetLessonPreviewReturn {
  setLessonPreview: (
    id: string,
    isPreview: boolean,
  ) => Promise<CourseLesson>;
  isLoading: boolean;
  error: string | null;
}

export function useSetLessonPreview(): UseSetLessonPreviewReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLessonPreview = async (id: string, isPreview: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await courseLessonService.setLessonPreview(
        id,
        isPreview,
      );
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update lesson preview access.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setLessonPreview,
    isLoading,
    error,
  };
}
