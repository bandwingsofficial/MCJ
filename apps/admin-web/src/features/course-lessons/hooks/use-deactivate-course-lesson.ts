"use client";

import { useState } from "react";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";

import type { CourseLesson } from "@/src/features/course-lessons/types";

interface UseDeactivateCourseLessonReturn {
  deactivateCourseLesson: (id: string) => Promise<CourseLesson>;
  isLoading: boolean;
  error: string | null;
}

export function useDeactivateCourseLesson(): UseDeactivateCourseLessonReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deactivateCourseLesson = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await courseLessonService.deactivateCourseLesson(id);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to deactivate course lesson.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deactivateCourseLesson,
    isLoading,
    error,
  };
}
