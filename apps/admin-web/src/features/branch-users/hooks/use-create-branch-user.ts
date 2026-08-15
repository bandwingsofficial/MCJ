"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

import { CreateBranchUserRequest } from "@/src/features/branch-users/types/branch-user.types";

interface UseCreateBranchUserReturn {
  createBranchUser: (
    payload: CreateBranchUserRequest
  ) => Promise<void>;

  isLoading: boolean;
}

export const useCreateBranchUser =
  (): UseCreateBranchUserReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const createBranchUser =
      async (
        payload: CreateBranchUserRequest
      ): Promise<void> => {
        try {
          setIsLoading(true);

          await branchUserService.createBranchUser(
            payload
          );

          appToast.success(
            "Branch user created successfully"
          );
        } catch (error) {
          let message =
            "Failed to create branch user";

          if (
            error instanceof AxiosError
          ) {
            message =
              error.response?.data
                ?.message ||
              error.response?.data
                ?.error ||
              error.message;
          } else if (
            error instanceof Error
          ) {
            message =
              error.message;
          }

          appToast.error(
            message
          );

          return Promise.reject(
            new Error(message)
          );
        } finally {
          setIsLoading(false);
        }
      };

    return {
      createBranchUser,
      isLoading,
    };
  };
