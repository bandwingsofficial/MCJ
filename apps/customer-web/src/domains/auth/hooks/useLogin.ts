"use client";

import { authApi } from "../api/auth.api";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

interface ApiResponse<T> {
  success: boolean;

  message: string;

  data?: T;
}

export const useLogin = () => {
  const setAuth = useAuthStore(
    (s) => s.setAuth
  );

  const login = async (data: {
    identifier: string;

    password: string;
  }): Promise<ApiResponse<any>> => {
    try {
      // =========================
      // CLEAR OLD TOKENS
      // =========================

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      // =========================
      // LOGIN
      // =========================

      const res = await authApi.login(
        data
      );

      if (!res.data.success) {
        return res.data;
      }

      const loginData = res.data.data;

      // =========================
      // STORE NEW TOKENS
      // =========================

      localStorage.setItem(
        "accessToken",
        loginData.accessToken
      );

      localStorage.setItem(
        "refreshToken",
        loginData.refreshToken
      );

      // =========================
      // FETCH USER
      // =========================

      const me = await authApi.me();

      if (me.data.success) {
        setAuth(
          me.data.data,

          loginData.accessToken,

          loginData.refreshToken
        );
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