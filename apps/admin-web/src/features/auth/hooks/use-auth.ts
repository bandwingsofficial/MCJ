"use client";

// src/features/auth/hooks/use-auth.ts

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

import { authService } from "@/src/features/auth/services/auth.service";

export const useAuth = () => {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    setUser,
    clearUser,
  } = useAuthStore();

 const logout = async () => {
  try {
    await authService.logout();
  } finally {
    clearUser();

    router.replace("/login");
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