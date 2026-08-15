"use client";

import { useState } from "react";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";

import type { CourseLesson } from "@/src/features/course-lessons/types";

interface UseActivateCourseLessonReturn {
  activateCourseLesson: (id: string) => Promise<CourseLesson>;
  isLoading: boolean;
  error: string | null;
}

export function useActivateCourseLesson(): UseActivateCourseLessonReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateCourseLesson = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await courseLessonService.activateCourseLesson(id);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to activate course lesson.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activateCourseLesson,
    isLoading,
    error,
  };
}
