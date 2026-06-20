"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { studentService } from "@/src/features/students/services/student.service";

import {
  Student,
} from "@/src/features/students/types/student.types";

interface UseStudentOptions {
  id: string;
}

interface UseStudentReturn {
  student: Student | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useStudent = ({
  id,
}: UseStudentOptions): UseStudentReturn => {
  const [
    student,
    setStudent,
  ] =
    useState<Student | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const fetchStudent =
    useCallback(async () => {
      try {
        setIsLoading(true);

        setError(null);

        const response =
          await studentService.getStudent(
            id
          );

        setStudent(
          response.data
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch student."
        );
      } finally {
        setIsLoading(false);
      }
    }, [id]);

  useEffect(() => {
    if (id) {
      void fetchStudent();
    }
  }, [
    id,
    fetchStudent,
  ]);

  return {
    student,

    isLoading,

    error,

    refetch:
      fetchStudent,
  };
};