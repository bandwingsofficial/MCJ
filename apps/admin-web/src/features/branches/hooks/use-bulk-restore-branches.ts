"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";
import type { BulkBranchOperationResult } from "@/src/features/branches/types/branch.types";

interface UseBulkRestoreBranchesReturn {
  bulkRestoreBranches: (
    branchIds: string[]
  ) => Promise<BulkBranchOperationResult | null>;
  isPending: boolean;
}

export function useBulkRestoreBranches(): UseBulkRestoreBranchesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkRestoreBranches = async (branchIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await branchService.bulkRestoreBranches(branchIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore branches"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkRestoreBranches, isPending };
}
