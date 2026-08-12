"use client";

import { useState } from "react";

import { branchService } from "@/src/features/branches/services/branch.service";

import { appToast } from "@/src/shared/components/ui/toast";

interface UsePermanentDeleteBranchReturn {
  isPending: boolean;

  permanentDeleteBranch: (id: string) => Promise<boolean>;
}

export const usePermanentDeleteBranch =
  (): UsePermanentDeleteBranchReturn => {
    const [isPending, setIsPending] = useState(false);

    const permanentDeleteBranch = async (
      id: string
    ): Promise<boolean> => {
      if (isPending) {
        return false;
      }

      try {
        setIsPending(true);

        const response =
          await branchService.permanentDeleteBranch(id);

        appToast.success(
          response.message ||
            "Branch permanently deleted successfully"
        );

        return true;
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Failed to permanently delete branch"
        );

        return false;
      } finally {
        setIsPending(false);
      }
    };

    return {
      isPending,
      permanentDeleteBranch,
    };
  };
