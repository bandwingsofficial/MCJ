"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";
import type { BulkBranchOperationResult } from "@/src/features/branches/types/branch.types";

interface UseBulkDeleteBranchesReturn {
  bulkDeleteBranches: (
    branchIds: string[]
  ) => Promise<BulkBranchOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeleteBranches(): UseBulkDeleteBranchesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDeleteBranches = async (branchIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await branchService.bulkDeleteBranches(branchIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to archive branches"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDeleteBranches, isPending };
}
