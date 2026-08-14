"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";
import type { BulkBranchOperationResult } from "@/src/features/branches/types/branch.types";

interface UseBulkPermanentDeleteBranchesReturn {
  bulkPermanentDeleteBranches: (
    branchIds: string[]
  ) => Promise<BulkBranchOperationResult | null>;
  isPending: boolean;
}

export function useBulkPermanentDeleteBranches(): UseBulkPermanentDeleteBranchesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkPermanentDeleteBranches = async (
    branchIds: string[]
  ) => {
    try {
      setIsPending(true);
      const response =
        await branchService.bulkPermanentDeleteBranches(
          branchIds
        );
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete branches"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkPermanentDeleteBranches, isPending };
}
