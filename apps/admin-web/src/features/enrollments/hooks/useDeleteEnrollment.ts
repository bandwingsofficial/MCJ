"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { enrollmentService } from "../services/enrollment.service";

interface UseDeleteEnrollmentReturn {
  deleteEnrollment: (
    id: string,
  ) => Promise<void>;

  isLoading: boolean;
}

export const useDeleteEnrollment =
  (): UseDeleteEnrollmentReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deleteEnrollment = async (
      id: string,
    ) => {
      try {
        setIsLoading(true);

        const response =
          await enrollmentService.deleteEnrollment(
            id,
          );

        appToast.success(
          response.message,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete enrollment.";

        appToast.error(message);

        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    return {
      deleteEnrollment,
      isLoading,
    };
  };