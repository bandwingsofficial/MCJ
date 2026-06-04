"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

interface UseActivateBranchUserReturn {
  activateBranchUser: (
    id: string
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const useActivateBranchUser =
  (): UseActivateBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const activateBranchUser =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.activateBranchUser(
            id
          );

          appToast.success(
            "Branch user activated successfully"
          );

          return true;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to activate branch user";

          appToast.error(message);

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      activateBranchUser,
      isLoading,
    };
  };