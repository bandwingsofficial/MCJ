"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

import { authApi } from "../api/auth.api";

export const useLogout = () => {
  const router = useRouter();

  const clearAuth = useAuthStore(
    (s) => s.clearAuth
  );

  const logout = async () => {
    try {
      // =========================
      // LOGOUT API
      // =========================

      await authApi.logout();
    } catch (error) {
      console.error(
        "Logout API failed:",
        error
      );
    } finally {
      // =========================
      // ALWAYS CLEAN FRONTEND
      // =========================

      clearAuth();

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      router.replace("/login");
    }
  };

  return { logout };
};