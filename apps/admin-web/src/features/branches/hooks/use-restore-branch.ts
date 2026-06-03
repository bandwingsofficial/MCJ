"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";

interface UseRestoreBranchReturn {
  restoreBranch: (
    id: string
  ) => Promise<boolean>;

  isPending: boolean;
}

export const useRestoreBranch =
  (): UseRestoreBranchReturn => {
    const [isPending, setIsPending] =
      useState(false);

    const restoreBranch = async (
      id: string
    ): Promise<boolean> => {
      try {
        setIsPending(true);

        const response =
          await branchService.restoreBranch(
            id
          );

        appToast.success(
          response.message
        );

        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to restore branch";

        appToast.error(message);

        return false;
      } finally {
        setIsPending(false);
      }
    };

    return {
      restoreBranch,
      isPending,
    };
  };