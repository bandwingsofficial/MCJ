"use client";

import { useState } from "react";

import { studentProfileService } from "@/src/features/student/services";

import type {
  CreateStudentProfileRequest,
} from "@/src/features/student/types";

export function useCreateStudentProfile() {
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

  const createProfile =
    async (
      payload: CreateStudentProfileRequest,
    ) => {
      try {
        setIsSubmitting(true);

        const data =
          await studentProfileService.createProfile(
            payload,
          );

        setError(null);

        return data;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create profile.";

        setError(message);

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };

  return {
    createProfile,
    isSubmitting,
    error,
  };
}