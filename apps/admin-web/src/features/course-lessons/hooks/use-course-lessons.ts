"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_COURSE_LESSON_FILTERS,
} from "@/src/features/course-lessons/constants/course-lesson.constants";

import {
  courseLessonService,
} from "@/src/features/course-lessons/services/course-lesson.service";

import type {
  CourseLesson,
  CourseLessonFilters,
} from "@/src/features/course-lessons/types";

interface UseCourseLessonsReturn {
  courseLessons: CourseLesson[];

  isLoading: boolean;

  error: string | null;

  filters: CourseLessonFilters;

  setFilters: React.Dispatch<
    React.SetStateAction<CourseLessonFilters>
  >;

  refetch: () => Promise<void>;
}

interface UseCourseLessonsProps {
  courseId: string;

  includeDeleted?: boolean;
}

export const useCourseLessons = (
  props?: UseCourseLessonsProps,
): UseCourseLessonsReturn => {
  const courseId =
    props?.courseId ?? "";

  const includeDeleted =
    props?.includeDeleted ??
    false;

  const [
    courseLessons,
    setCourseLessons,
  ] = useState<CourseLesson[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [filters, setFilters] =
    useState<CourseLessonFilters>(
      DEFAULT_COURSE_LESSON_FILTERS,
    );

  const fetchCourseLessons =
    useCallback(async () => {
      try {
        setIsLoading(true);

        setError(null);

        const response =
          await courseLessonService.getCourseLessons(
            {
              courseId,
              includeDeleted,
            },
          );

        setCourseLessons(
          response.data,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch course lessons.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [
      courseId,
      includeDeleted,
    ]);

  useEffect(() => {
    void fetchCourseLessons();
  }, [
    fetchCourseLessons,
  ]);

  return {
    courseLessons,
    isLoading,
    error,
    filters,
    setFilters,
    refetch:
      fetchCourseLessons,
  };
};