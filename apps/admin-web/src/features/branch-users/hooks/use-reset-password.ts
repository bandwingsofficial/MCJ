"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

interface UseResetPasswordReturn {
  resetPassword: (
    id: string,
    newPassword: string
  ) => Promise<boolean>;

  isLoading: boolean;
}

export const useResetPassword =
  (): UseResetPasswordReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const resetPassword =
      async (
        id: string,
        newPassword: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          await branchUserService.resetPassword(
            id,
            newPassword
          );

          appToast.success(
            "Password reset successfully"
          );

          return true;
        } catch (error) {
          let message =
            "Failed to reset password";

          if (
            error instanceof AxiosError
          ) {
            message =
              error.response?.data
                ?.message ||
              error.message;
          } else if (
            error instanceof Error
          ) {
            message =
              error.message;
          }

          appToast.error(message);

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      resetPassword,
      isLoading,
    };
  };