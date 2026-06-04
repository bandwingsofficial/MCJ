"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

import {
  UpdateBranchUserRequest,
} from "@/src/features/branch-users/types/branch-user.types";

interface UseUpdateBranchUserReturn {
  updateBranchUser: (
    id: string,
    payload: UpdateBranchUserRequest
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const useUpdateBranchUser =
  (): UseUpdateBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const updateBranchUser =
      async (
        id: string,
        payload: UpdateBranchUserRequest
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.updateBranchUser(
            id,
            payload
          );

          appToast.success(
            "Branch user updated successfully"
          );

          return true;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update branch user";

          appToast.error(message);

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      updateBranchUser,
      isLoading,
    };
  };