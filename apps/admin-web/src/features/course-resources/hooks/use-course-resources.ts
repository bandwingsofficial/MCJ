"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_COURSE_RESOURCE_FILTERS,
} from "@/src/features/course-resources/constants/course-resource.constants";

import {
  courseResourceService,
} from "@/src/features/course-resources/services/course-resource.service";

import type {
  CourseResource,
  CourseResourceFilters,
} from "@/src/features/course-resources/types";

interface UseCourseResourcesProps {
  lessonId: string;

  includeDeleted?: boolean;
}

interface UseCourseResourcesReturn {
  courseResources: CourseResource[];

  isLoading: boolean;

  error: string | null;

  filters: CourseResourceFilters;

  setFilters: React.Dispatch<
    React.SetStateAction<CourseResourceFilters>
  >;

  refetch: () => Promise<void>;
}

export const useCourseResources = ({
  lessonId,
  includeDeleted = false,
}: UseCourseResourcesProps): UseCourseResourcesReturn => {
  const [
    courseResources,
    setCourseResources,
  ] = useState<CourseResource[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [filters, setFilters] =
    useState<CourseResourceFilters>({
      ...DEFAULT_COURSE_RESOURCE_FILTERS,
      lessonId,
      includeDeleted,
    });

  const fetchCourseResources =
    useCallback(async () => {
      try {
        setIsLoading(true);

        setError(null);

        const response =
          await courseResourceService.getCourseResources(
            {
              lessonId,
              includeDeleted,
            },
          );

        setCourseResources(
          response.data,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch course resources.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [
      lessonId,
      includeDeleted,
    ]);

  useEffect(() => {
    void fetchCourseResources();
  }, [fetchCourseResources]);

  return {
    courseResources,
    isLoading,
    error,
    filters,
    setFilters,
    refetch:
      fetchCourseResources,
  };
};