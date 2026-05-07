"use client";

import { authApi } from "../api/auth.api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const useRegister = () => {
  const register = async (data: any): Promise<ApiResponse<any>> => {
    try {
      const res = await authApi.register(data);
      return res.data;
    } catch (err: any) {
      return (
        err.response?.data || {
          success: false,
          message: "Registration failed",
        }
      );
    }
  };

  return { register };
};