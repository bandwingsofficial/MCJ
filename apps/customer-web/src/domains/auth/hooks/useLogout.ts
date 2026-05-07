"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

import { authApi } from "../api/auth.api";

export const useLogout = () => {
  const router = useRouter();

  const clearUser =
    useAuthStore(
      (s) => s.clearUser
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
      // CLEAR FRONTEND STATE
      // =========================

      clearUser();

      router.replace("/login");
    }
  };

  return { logout };
};