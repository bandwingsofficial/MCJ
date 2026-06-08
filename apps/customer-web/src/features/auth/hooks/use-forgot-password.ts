"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { authService } from "@/src/features/auth/services/auth.service";

import type {
  PasswordResetRequest,
} from "@/src/features/auth/types/auth.types";

export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (
      payload: PasswordResetRequest
    ) =>
      authService.requestPasswordReset(
        payload
      ),

    onSuccess: (
      _response,
      variables
    ) => {
      toast.success(
        "Password reset link sent to your email"
      );

      router.push(
        `/reset-password?email=${encodeURIComponent(
          variables.email
        )}`
      );
    },

    onError: (
      error: any
    ) => {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send password reset link";

      toast.error(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage
      );
    },
  });
}