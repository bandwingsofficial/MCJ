// src/features/auth/services/auth.service.ts

import { authApi } from "@/src/features/auth/api/auth.api";

import { TokenStorage } from "@/src/core/storage/token-storage";

import {
  LoginRequestDto,
  LoginResponseDto,
  VerifyTotpRequestDto,
  VerifyTotpResponseDto,
} from "@/src/features/auth/types/auth.types";

export const authService = {
  login: async (
    payload: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    return authApi.login(
      payload
    );
  },

  verifyTotp: async (
    payload: VerifyTotpRequestDto
  ): Promise<VerifyTotpResponseDto> => {
    const response =
      await authApi.verifyTotp(
        payload
      );

    TokenStorage.setAccessToken(
      response.data.accessToken
    );

    TokenStorage.setRefreshToken(
      response.data.refreshToken
    );

    return response;
  },

  getProfile: async () => {
    return authApi.getProfile();
  },

  logout: async (): Promise<void> => {
  try {
    await authApi.logout();
  } finally {
    TokenStorage.clear();
  }
},
};