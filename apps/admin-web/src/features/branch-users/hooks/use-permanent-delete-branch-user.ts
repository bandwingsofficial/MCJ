"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface UsePermanentDeleteBranchUserReturn {
  permanentDeleteBranchUser: (
    id: string
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const usePermanentDeleteBranchUser =
  (): UsePermanentDeleteBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const permanentDeleteBranchUser =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.permanentlyDeleteBranchUser(
            id
          );

          appToast.success(
            "User permanently deleted successfully"
          );

          return true;
        } catch (error) {
          appToast.error(
            getErrorMessage(error) ||
              "Failed to permanently delete user",
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      permanentDeleteBranchUser,
      isLoading,
    };
  };
