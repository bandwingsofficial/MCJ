"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

import { CreateBranchUserRequest } from "@/src/features/branch-users/types/branch-user.types";

export const DELETED_ACCOUNT_RESTORABLE = "DELETED_ACCOUNT_RESTORABLE";

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

          const response =
            await branchUserService.createBranchUser(
              payload
            );

          appToast.success(
            response.message ||
              (payload.confirmRestore
                ? "Existing deleted user restored and updated successfully."
                : "User created successfully.")
          );
        } catch (error) {
          let message =
            "Failed to create branch user";
          let code: string | undefined;

          if (error instanceof AxiosError) {
            code = error.response?.data?.code;
            message =
              error.response?.data?.message ||
              error.response?.data?.error ||
              error.message;
          } else if (error instanceof Error) {
            message = error.message;
          }

          if (code === DELETED_ACCOUNT_RESTORABLE) {
            const restorable = new Error(message);
            (restorable as Error & { code: string }).code =
              DELETED_ACCOUNT_RESTORABLE;
            throw restorable;
          }

          appToast.error(message);

          return Promise.reject(new Error(message));
        } finally {
          setIsLoading(false);
        }
      };

    return {
      createBranchUser,
      isLoading,
    };
  };
