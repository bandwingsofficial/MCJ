"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { enrollmentService } from "../services/enrollment.service";

interface UseRestoreEnrollmentReturn {
  restoreEnrollment: (
    id: string,
  ) => Promise<void>;

  isLoading: boolean;
}

export const useRestoreEnrollment =
  (): UseRestoreEnrollmentReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const restoreEnrollment = async (
      id: string,
    ) => {
      try {
        setIsLoading(true);

        const response =
          await enrollmentService.restoreEnrollment(
            id,
          );

        appToast.success(
          response.message,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to restore enrollment.";

        appToast.error(message);

        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    return {
      restoreEnrollment,
      isLoading,
    };
  };