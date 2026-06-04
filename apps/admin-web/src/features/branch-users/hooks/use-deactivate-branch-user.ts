"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

interface UseDeactivateBranchUserReturn {
  deactivateBranchUser: (
    id: string
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const useDeactivateBranchUser =
  (): UseDeactivateBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deactivateBranchUser =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.deactivateBranchUser(
            id
          );

          appToast.success(
            "Branch user deactivated successfully"
          );

          return true;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to deactivate branch user";

          appToast.error(message);

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      deactivateBranchUser,
      isLoading,
    };
  };