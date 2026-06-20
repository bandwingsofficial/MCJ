"use client";

import { useState } from "react";

import { studentJobService } from "@/src/features/student-jobs/services";

import type {
  ApplyJobRequest,
  ApplyJobResponse,
} from "@/src/features/student-jobs/types";

interface UseApplyJobReturn {
  applyJob: (
    jobId: string,
    payload: ApplyJobRequest,
  ) => Promise<ApplyJobResponse | null>;

  isSubmitting: boolean;

  error: string | null;

  application: ApplyJobResponse | null;

  reset: () => void;
}

export function useApplyJob(): UseApplyJobReturn {
  const [
    application,
    setApplication,
  ] = useState<ApplyJobResponse | null>(
    null,
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const applyJob = async (
    jobId: string,
    payload: ApplyJobRequest,
  ): Promise<ApplyJobResponse | null> => {
    if (isSubmitting) {
      return null;
    }

    try {
      setIsSubmitting(true);

      setError(null);

      const response =
        await studentJobService.applyJob(
          jobId,
          payload,
        );

      setApplication(response);

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit application.";

      setError(message);

      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = (): void => {
    setApplication(null);

    setError(null);
  };

  return {
    applyJob,

    application,

    isSubmitting,

    error,

    reset,
  };
}