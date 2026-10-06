// src/features/auth/hooks/use-reset-password.ts

"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { authService } from "@/src/features/auth/services/auth.service";

import type {
  PasswordResetConfirmRequest,
} from "@/src/features/auth/types/auth.types";

export function useResetPassword(token: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Pick<PasswordResetConfirmRequest, "newPassword">) =>
      authService.confirmPasswordReset({
        token,
        newPassword: payload.newPassword,
      }),

    onSuccess: () => {
      toast.success(
        "Password reset successfully"
      );

      router.push(
        "/login"
      );
    },

    onError: (
      error: any
    ) => {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password";

      toast.error(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage
      );
    },
  });
}