"use client";

import { useCallback, useEffect, useState } from "react";

import { studentCourseService } from "@/src/features/student-course/services/student-course.service";

import type { StudentCourseProgressDto } from "@/src/features/student-course/types/api.types";
import type { StudentCourse } from "@/src/features/student-course/types/course.types";

interface UseStudentCourseReturn {
  course: StudentCourse | null;
  progress: StudentCourseProgressDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStudentCourse(courseId: string): UseStudentCourseReturn {
  const [course, setCourse] = useState<StudentCourse | null>(null);
  const [progress, setProgress] = useState<StudentCourseProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId.trim()) {
      setError("Course ID is required.");
      setCourse(null);
      setProgress(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await studentCourseService.getCourse(courseId);
      setCourse(data.course);
      setProgress(data.progress);
      setError(null);
    } catch (err) {
      setCourse(null);
      setProgress(null);
      setError(
        err instanceof Error ? err.message : "Failed to load course.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
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
    progress,
    isLoading,
    error,
    refetch: fetchCourse,
  };
}
