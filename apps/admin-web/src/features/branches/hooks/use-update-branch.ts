"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import {
  Branch,
  UpdateBranchRequest,
} from "@/src/features/branches/types/branch.types";

import { branchService } from "@/src/features/branches/services/branch.service";

interface UseUpdateBranchReturn {
  updateBranch: (
    id: string,
    payload: UpdateBranchRequest
  ) => Promise<Branch>;

  isPending: boolean;
}

export const useUpdateBranch =
  (): UseUpdateBranchReturn => {
    const [isPending, setIsPending] =
      useState(false);

    const updateBranch = async (
      id: string,
      payload: UpdateBranchRequest
    ): Promise<Branch> => {
      try {
        setIsPending(true);

        const response =
          await branchService.updateBranch(
            id,
            payload
          );

        if (!response?.data?.id) {
          throw new Error(
            "Branch update did not return saved data."
          );
        }

        appToast.success(
          response.message ||
            "Branch updated successfully"
        );

        return response.data;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update branch";

        appToast.error(message);

        throw error instanceof Error
          ? error
          : new Error(message);
      } finally {
        setIsPending(false);
      }
    };

    return {
      updateBranch,
      isPending,
    };
  };
