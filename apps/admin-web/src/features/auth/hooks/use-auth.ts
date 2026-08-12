"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { authService } from "@/src/features/auth/services/auth.service";

export const useAuth = () => {
  const router = useRouter();

  const {
    user,
    status,
    isAuthenticated,
    setUser,
    clearUser,
    setStatus,
  } = useAuthStore();

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearUser();
      router.replace("/login");
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } finally {
      clearUser();
      router.replace("/login");
    }
  };

  return {
    user,
    status,
    isAuthenticated,
    setUser,
    clearUser,
    setStatus,
    logout,
    logoutAll,
  };
};
