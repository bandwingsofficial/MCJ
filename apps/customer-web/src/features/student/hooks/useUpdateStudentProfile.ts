"use client";

import { useState } from "react";

import { studentProfileService } from "@/src/features/student/services";

import type {
  UpdateStudentProfileRequest,
} from "@/src/features/student/types";

export function useUpdateStudentProfile() {
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

  const updateProfile =
    async (
      payload: UpdateStudentProfileRequest,
    ) => {
      try {
        setIsSubmitting(true);

        const data =
          await studentProfileService.updateProfile(
            payload,
          );

        setError(null);

        return data;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update profile.";

        setError(message);

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };

  return {
    updateProfile,
    isSubmitting,
    error,
  };
}