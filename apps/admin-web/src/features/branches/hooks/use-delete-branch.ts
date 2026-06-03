"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";

interface UseDeleteBranchReturn {
  deleteBranch: (
    id: string
  ) => Promise<void>;

  isPending: boolean;
}

export const useDeleteBranch =
  (): UseDeleteBranchReturn => {
    const [isPending, setIsPending] =
      useState(false);

    const deleteBranch = async (
      id: string
    ) => {
      try {
        setIsPending(true);

        const response =
          await branchService.deleteBranch(
            id
          );

        appToast.success(
          response.message
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete branch";

        appToast.error(message);

        return;
      } finally {
        setIsPending(false);
      }
    };

    return {
      deleteBranch,
      isPending,
    };
  };