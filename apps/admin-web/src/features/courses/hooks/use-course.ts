"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  CourseDetails,
} from "@/src/features/courses/types/course.types";

interface UseCourseReturn {
  course: CourseDetails | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useCourse = (
  courseId: string
): UseCourseReturn => {
  const [course, setCourse] =
    useState<CourseDetails | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const fetchCourse =
    useCallback(async () => {
      if (!courseId) {
        return;
      }

      try {
        setIsLoading(true);

        setError(null);

        const response =
          await courseService.getCourse(
            courseId
          );

        setCourse(
          response.data
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch course";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [courseId]);

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

  return {
    course,
    isLoading,
    error,
    refetch: fetchCourse,
  };
};