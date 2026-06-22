"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";

import type {
  CourseModuleFilters,
  CourseModuleListItem,
} from "@/src/features/course-modules/types/course-module.types";

interface UseCourseModulesReturn {
  modules: CourseModuleListItem[];

  isLoading: boolean;

  error: string | null;

  filters: CourseModuleFilters;

  setFilters: (
    filters: CourseModuleFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useCourseModules =
  (
    initialFilters: CourseModuleFilters
  ): UseCourseModulesReturn => {
    const [
      modules,
      setModules,
    ] = useState<
      CourseModuleListItem[]
    >([]);

    const [
      isLoading,
      setIsLoading,
    ] = useState(true);

    const [
      error,
      setError,
    ] = useState<string | null>(
      null
    );

    const [
      filters,
      setFilters,
    ] =
      useState<CourseModuleFilters>(
        initialFilters
      );

    const fetchModules =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await courseModuleService.getCourseModules(
              filters
            );

          setModules(
            response.data
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch course modules.";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchModules();
    }, [fetchModules]);

    return {
      modules,

      isLoading,

      error,

      filters,

      setFilters,

      refetch:
        fetchModules,
    };
  };