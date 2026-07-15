"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { studentCourseService } from "@/src/features/student-course/services/student-course.service";

import type {
  StudentCourse,
} from "@/src/features/student-course/types/course.types";

interface UseStudentCourseReturn {
  course: StudentCourse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStudentCourse(
  courseId: string,
): UseStudentCourseReturn {
  const [
    course,
    setCourse,
  ] = useState<StudentCourse | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const fetchCourse =
    useCallback(async () => {
      if (!courseId.trim()) {
        setError("Course ID is required.");
        setCourse(null);
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        const data =
          await studentCourseService.getCourse(
            courseId,
          );

        setCourse(data);

        setError(null);
      } catch (error) {
        setCourse(null);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load course.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [courseId]);

  useEffect(() => {
    let isMounted = true;

    const loadCourse =
      async () => {
        if (!isMounted) {
          return;
        }

        await fetchCourse();
      };

    void loadCourse();

    return () => {
      isMounted = false;
    };
  }, [fetchCourse]);

  return {
    course,
    isLoading,
    error,
    refetch: fetchCourse,
  };
}