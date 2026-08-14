"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";
import type {
  BranchStatus,
  BulkBranchOperationResult,
} from "@/src/features/branches/types/branch.types";

interface UseBulkUpdateStatusReturn {
  bulkUpdateStatus: (
    branchIds: string[],
    status: BranchStatus
  ) => Promise<BulkBranchOperationResult | null>;
  isPending: boolean;
}

export function useBulkUpdateStatus(): UseBulkUpdateStatusReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkUpdateStatus = async (
    branchIds: string[],
    status: BranchStatus
  ) => {
    try {
      setIsPending(true);
      const response = await branchService.bulkUpdateStatus(
        branchIds,
        status
      );
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to update branch statuses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkUpdateStatus, isPending };
}
