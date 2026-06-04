"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { courseService } from "@/src/features/courses/services/course.service";

import {
  CourseFilters,
  CourseListItem,
} from "@/src/features/courses/types/course.types";

interface UseCoursesReturn {
  courses: CourseListItem[];

  count: number;

  isLoading: boolean;

  error: string | null;

  filters: CourseFilters;

  setFilters: (
    filters: CourseFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useCourses =
  (): UseCoursesReturn => {
    const [courses, setCourses] =
      useState<
        CourseListItem[]
      >([]);

    const [count, setCount] =
      useState(0);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const [filters, setFilters] =
      useState<CourseFilters>({
        search: "",
        includeDeleted: false,
        status: undefined,
        skip: 0,
        take: 10,
      });

    const fetchCourses =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseService.getCourses(
              filters
            );

         setCourses(
  response.data ?? []
);

setCount(
  response.data?.length ??
    0
);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch courses";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchCourses();
    }, [fetchCourses]);

    return {
      courses,
      count,
      isLoading,
      error,
      filters,
      setFilters,
      refetch: fetchCourses,
    };
  };