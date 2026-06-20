"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { studentService } from "@/src/features/students/services/student.service";

import {
  DEFAULT_STUDENT_FILTERS,
} from "@/src/features/students/constants/student.constants";

import {
  Student,
  StudentFilters,
} from "@/src/features/students/types/student.types";

interface UseStudentsOptions {
  filters?: StudentFilters;
}

interface UseStudentsReturn {
  students: Student[];

  count: number;

  isLoading: boolean;

  error: string | null;

  filters: StudentFilters;

  setFilters: (
    filters: StudentFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useStudents = (
  options?: UseStudentsOptions
): UseStudentsReturn => {
  const [
    students,
    setStudents,
  ] = useState<Student[]>([]);

  const [count, setCount] =
    useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [
    filters,
    setFilters,
  ] = useState<StudentFilters>(
    options?.filters ??
      DEFAULT_STUDENT_FILTERS
  );

  const fetchStudents =
    useCallback(async () => {
      try {
        setIsLoading(true);

        setError(null);

        const response =
          await studentService.getStudents(
            filters
          );
          console.log("FULL RESPONSE", response);


        setStudents(response.data);

setCount(response.data.length);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch students."
        );
      } finally {
        setIsLoading(false);
      }
    }, [filters]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  return {
    students,

    count,

    isLoading,

    error,

    filters,

    setFilters,

    refetch:
      fetchStudents,
  };
};