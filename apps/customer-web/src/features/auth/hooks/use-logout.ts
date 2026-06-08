// src/features/auth/hooks/use-logout.ts

"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { authService } from "@/src/features/auth/services/auth.service";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

export function useLogout() {
  const router = useRouter();

  const clearUser =
    useAuthStore(
      (state) => state.clearUser
    );

  return useMutation({
    mutationFn: () =>
      authService.logout(),

    onSuccess: () => {
      toast.success(
        "Logged out successfully"
      );
    },

    onError: (
      error: any
    ) => {
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Logout failed";

      toast.error(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage
      );
    },

    onSettled: () => {
      clearUser();

      router.replace(
        "/login"
      );
    },
  });
}