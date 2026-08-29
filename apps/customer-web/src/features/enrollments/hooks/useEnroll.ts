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
        let message = "Something went wrong.";

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const axiosError = error as {
            response?: {
              data?: {
                code?: string;
                message?: string;
                meta?: {
                  existingEnrollment?: {
                    branch?: { branchName?: string };
                    batch?: { name?: string; code?: string };
                    course?: { title?: string };
                  };
                };
              };
            };
          };
          const data = axiosError.response?.data;
          message =
            (typeof data?.message === "string" && data.message.trim()) ||
            getEnrollmentErrorMessage(data?.code);

          const existing = data?.meta?.existingEnrollment;
          if (existing) {
            const batchName = existing.batch?.name?.trim();
            const batchCode = existing.batch?.code?.trim();
            const batch = batchName
              ? batchCode
                ? `${batchName} (${batchCode})`
                : batchName
              : "";
            const location = [
              existing.branch?.branchName,
              batch,
              existing.course?.title,
            ]
              .filter(Boolean)
              .join(" • ");
            if (location) {
              message = `${message} Current enrollment: ${location}.`;
            }
          }
        } else if (error instanceof Error) {
          message = error.message;
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