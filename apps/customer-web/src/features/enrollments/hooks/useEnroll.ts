"use client";

import { useState } from "react";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { getEnrollmentErrorMessage } from "@/src/features/enrollments/utils/enrollment-error";

import type {
  CreateEnrollmentRequest,
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

interface UseEnrollResult {
  createEnrollment: (
    payload: CreateEnrollmentRequest,
  ) => Promise<Enrollment | null>;

  isSubmitting: boolean;

  error: string | null;

  clearError: () => void;
}

export function useEnroll(): UseEnrollResult {
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const clearError = () => {
    setError(null);
  };

  const createEnrollment =
    async (
      payload: CreateEnrollmentRequest,
    ): Promise<Enrollment | null> => {
      if (isSubmitting) {
        return null;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        const enrollment =
          await enrollmentService.createEnrollment(
            payload,
          );

        return enrollment;
      } catch (error) {
        let message =
          "Something went wrong.";

        if (
          error instanceof Error
        ) {
          message =
            error.message;
        }

        if (
          typeof error ===
            "object" &&
          error !== null &&
          "response" in error
        ) {
          const axiosError =
            error as {
              response?: {
                data?: {
                  code?: string;
                };
              };
            };

          message =
            getEnrollmentErrorMessage(
              axiosError
                .response
                ?.data?.code,
            );
        }

        setError(message);

        return null;
      } finally {
        setIsSubmitting(false);
      }
    };

  return {
    createEnrollment,
    isSubmitting,
    error,
    clearError,
  };
}