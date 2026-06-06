"use client";

import { useRouter } from "next/navigation";

import { authService } from "@/src/features/auth/services/auth.service";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

export const useAuth = () => {
  const router =
    useRouter();

  const {
    user,
    isAuthenticated,
    setUser,
    clearUser,
  } = useAuthStore();

  const logout =
    async (): Promise<void> => {
      try {
        await authService.logout();
      } finally {
        clearUser();

        router.replace(
          "/login"
        );
      }
    };

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    logout,
  };
};