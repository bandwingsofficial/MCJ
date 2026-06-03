"use client";

import { useState } from "react";

import { authService } from "@/src/features/auth/services/auth.service";

import {
  LoginRequestDto,
  LoginResponseDto,
} from "@/src/features/auth/types/auth.types";

export const useLogin = () => {
  const [loading, setLoading] =
    useState(false);

  const login = async (
    payload: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    try {
      setLoading(true);

      return await authService.login(
        payload
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
  };
};