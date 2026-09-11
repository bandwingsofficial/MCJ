"use client";

import { useCallback, useEffect, useState } from "react";

import { studentJobService } from "@/src/features/student-jobs/services";
import { getJobApplicationStatusLabel } from "@/src/features/student-jobs/utils/job-application-status.utils";

import { useRefetchOnWindowFocus } from "./useRefetchOnWindowFocus";

interface UseSyncedJobApplicationStatusOptions {
  applicationId?: string | null;
  applicationNumber?: string | null;
  enabled?: boolean;
}

interface UseSyncedJobApplicationStatusReturn {
  statusLabel: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSyncedJobApplicationStatus({
  applicationId,
  applicationNumber,
  enabled = true,
}: UseSyncedJobApplicationStatusOptions): UseSyncedJobApplicationStatusReturn {
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (!applicationId && !applicationNumber) {
      setStatusLabel(null);
      setError("Application reference is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let application =
        applicationId != null && applicationId.length > 0
          ? await studentJobService.getMyApplication(applicationId)
          : null;

      if (!application && applicationNumber) {
        const applications =
          await studentJobService.getMyApplications();
        application =
          applications.find(
            (item) => item.applicationNumber === applicationNumber,
          ) ?? null;
      }

      if (!application) {
        setStatusLabel(null);
        setError("Application not found.");
        return;
      }

      setStatusLabel(
        getJobApplicationStatusLabel(application.status),
      );
    } catch (fetchError) {
      setStatusLabel(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch application status.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, applicationNumber, enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useRefetchOnWindowFocus(refetch, enabled);

  return {
    statusLabel,
    isLoading,
    error,
    refetch,
  };
}
