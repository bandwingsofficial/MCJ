"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Enrollment } from "../types";

import { enrollmentService } from "../services/enrollment.service";

interface UseEnrollmentReturn {
  enrollment: Enrollment | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useEnrollment = (
  id: string,
): UseEnrollmentReturn => {
  const [
    enrollment,
    setEnrollment,
  ] =
    useState<Enrollment | null>(
      null,
    );

  const [isLoading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const fetchEnrollment =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const response =
          await enrollmentService.getEnrollment(
            id,
          );

        setEnrollment(
          response.data,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load enrollment";

        setError(message);
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void fetchEnrollment();
  }, [fetchEnrollment]);

  return {
    enrollment,

    isLoading,

    error,

    refetch:
      fetchEnrollment,
  };
};