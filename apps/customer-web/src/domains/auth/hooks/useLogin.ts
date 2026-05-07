"use client";

import { authApi } from "../api/auth.api";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

interface ApiResponse<T> {
  success: boolean;

  message: string;

  data?: T;
}

export const useLogin = () => {
  const setUser = useAuthStore(
    (s) => s.setUser
  );

  const login = async (data: {
    identifier: string;

    password: string;
  }): Promise<ApiResponse<any>> => {
    try {
      // =========================
      // LOGIN
      // =========================

      const res =
        await authApi.login(data);

      if (!res.data.success) {
        return res.data;
      }

      // =========================
      // FETCH CURRENT USER
      // =========================

      const me =
        await authApi.me();

      if (me.data.success) {
        setUser(me.data.data);
      }

      return res.data;
    } catch (err: any) {
      return (
        err.response?.data || {
          success: false,

          message: "Login failed",
        }
      );
    }
  };

  return { login };
};