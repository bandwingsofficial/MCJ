"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { enrollmentService } from "../services/enrollment.service";

interface UsePermanentDeleteEnrollmentReturn {
  permanentDeleteEnrollment: (
    id: string,
  ) => Promise<void>;

  isLoading: boolean;
}

export const usePermanentDeleteEnrollment =
  (): UsePermanentDeleteEnrollmentReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const permanentDeleteEnrollment =
      async (id: string) => {
        try {
          setIsLoading(true);

          const response =
            await enrollmentService.permanentDeleteEnrollment(
              id,
            );

          appToast.success(
            response.message,
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to permanently delete enrollment.";

          appToast.error(message);

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      permanentDeleteEnrollment,
      isLoading,
    };
  };