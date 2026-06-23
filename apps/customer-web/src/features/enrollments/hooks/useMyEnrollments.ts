"use client";

import {
  useEffect,
  useState,
} from "react";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";

import type {
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

export function useMyEnrollments() {
  const [
    enrollments,
    setEnrollments,
  ] = useState<
    Enrollment[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const fetchEnrollments =
    async () => {
      try {
        setIsLoading(true);

        const data =
          await enrollmentService.getMyEnrollments();

        setEnrollments(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch enrollments",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchEnrollments();
  }, []);

  return {
    enrollments,
    isLoading,
    error,
    refetch:
      fetchEnrollments,
  };
}