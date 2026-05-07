"use client";

import { useEffect } from "react";

import { authApi } from "../api/auth.api";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

export const useMe = () => {
  const clearAuth = useAuthStore(
    (s) => s.clearAuth
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          localStorage.getItem("accessToken");

        // prevent unauthorized request

        if (!token) {
          return;
        }

        const res = await authApi.me();

        if (!res.data.success) {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    };

    fetchUser();
  }, [clearAuth]);
};