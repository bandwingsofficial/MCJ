// src/features/auth/hooks/use-register.ts

"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { authService } from "@/src/features/auth/services/auth.service";

import type {
  RegisterRequest,
} from "@/src/features/auth/types/auth.types";

export function useRegister(redirectTo?: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (
      payload: RegisterRequest
    ) =>
      authService.register(
        payload
      ),

    onSuccess: () => {
      toast.success(
        "Registration successful! Please log in to continue."
      );

      const loginPath = redirectTo
        ? `/login?redirect=${encodeURIComponent(redirectTo)}`
        : "/login";

      router.push(loginPath);
    },

    onError: (
      error: any
    ) => {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";

      toast.error(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage
      );
    },
  });
}