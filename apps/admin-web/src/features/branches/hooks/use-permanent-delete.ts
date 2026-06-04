"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";

interface UseDeleteBranchPermanentlyReturn {
  deleteBranchPermanently: (
    id: string
  ) => Promise<boolean>;

  isPending: boolean;
}

export const useDeleteBranchPermanently =
  (): UseDeleteBranchPermanentlyReturn => {
    const [isPending, setIsPending] =
      useState(false);

    const deleteBranchPermanently =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsPending(true);

          const response =
            await branchService.permanentlyDeleteBranch(
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
              : "Failed to permanently delete branch";

          appToast.error(message);

          return false;
        } finally {
          setIsPending(false);
        }
      };

    return {
      deleteBranchPermanently,
      isPending,
    };
  };