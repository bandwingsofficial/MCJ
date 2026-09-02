"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { jobService } from "@/src/features/jobs/services/job.service";
import type { BulkJobOperationResult } from "@/src/features/jobs/types/job.types";

interface UseBulkJobActionsReturn {
  bulkActivateJobs: (jobIds: string[]) => Promise<BulkJobOperationResult | null>;
  bulkDeactivateJobs: (
    jobIds: string[],
  ) => Promise<BulkJobOperationResult | null>;
  bulkArchiveJobs: (jobIds: string[]) => Promise<BulkJobOperationResult | null>;
  bulkRestoreJobs: (jobIds: string[]) => Promise<BulkJobOperationResult | null>;
  bulkPermanentDeleteJobs: (
    jobIds: string[],
  ) => Promise<BulkJobOperationResult | null>;
  isPending: boolean;
}

export function useBulkJobActions(): UseBulkJobActionsReturn {
  const [isPending, setIsPending] = useState(false);

  const run = async (
    jobIds: string[],
    operation: (jobIds: string[]) => Promise<BulkJobOperationResult>,
    errorMessage: string,
  ) => {
    try {
      setIsPending(true);
      return await operation(jobIds);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : errorMessage);
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return {
    bulkActivateJobs: (jobIds) =>
      run(jobIds, (ids) => jobService.bulkActivateJobs(ids), "Failed to activate jobs"),
    bulkDeactivateJobs: (jobIds) =>
      run(
        jobIds,
        (ids) => jobService.bulkDeactivateJobs(ids),
        "Failed to deactivate jobs",
      ),
    bulkArchiveJobs: (jobIds) =>
      run(jobIds, (ids) => jobService.bulkArchiveJobs(ids), "Failed to archive jobs"),
    bulkRestoreJobs: (jobIds) =>
      run(jobIds, (ids) => jobService.bulkRestoreJobs(ids), "Failed to restore jobs"),
    bulkPermanentDeleteJobs: (jobIds) =>
      run(
        jobIds,
        (ids) => jobService.bulkPermanentDeleteJobs(ids),
        "Failed to permanently delete jobs",
      ),
    isPending,
  };
}
