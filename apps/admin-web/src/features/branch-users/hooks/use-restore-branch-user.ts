"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface UseRestoreBranchUserReturn {
  restoreBranchUser: (
    id: string
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const useRestoreBranchUser =
  (): UseRestoreBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const restoreBranchUser =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.restoreBranchUser(
            id
          );

          appToast.success(
            "Branch user restored successfully"
          );

          return true;
        } catch (error) {
          appToast.error(
            getErrorMessage(error) ||
              "Failed to restore branch user",
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      restoreBranchUser,
      isLoading,
    };
  };