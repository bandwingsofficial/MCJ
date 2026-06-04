"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

interface UseDeleteBranchUserReturn {
  deleteBranchUser: (
    id: string
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const useDeleteBranchUser =
  (): UseDeleteBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deleteBranchUser =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.deleteBranchUser(
            id
          );

          appToast.success(
            "Branch user deleted successfully"
          );

          return true;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete branch user";

          appToast.error(message);

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      deleteBranchUser,
      isLoading,
    };
  };