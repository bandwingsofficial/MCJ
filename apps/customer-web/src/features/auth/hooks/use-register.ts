// src/features/auth/hooks/use-register.ts

"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { useAuthModalController } from "@/src/features/auth/components/auth-modal-context";
import { authService } from "@/src/features/auth/services/auth.service";

import type {
  RegisterRequest,
} from "@/src/features/auth/types/auth.types";

export function useRegister(redirectTo?: string) {
  const router = useRouter();
  const { isOpen, setAuthModalMode } = useAuthModalController();

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

      if (isOpen) {
        setAuthModalMode("login");
        return;
      }

      const loginPath = redirectTo
        ? `/login?redirect=${encodeURIComponent(redirectTo)}`
        : "/login";

      router.push(loginPath, { scroll: false });
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