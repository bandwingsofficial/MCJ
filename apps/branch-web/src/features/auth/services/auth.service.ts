// src/features/auth/services/auth.service.ts

import { authApi } from "@/src/features/auth/api/auth.api";

import { TokenStorage } from "@/src/core/storage/token-storage";

import {
  LoginRequestDto,
  LoginResponseDto,
} from "@/src/features/auth/types/auth.types";

import {
  ProfileResponseDto,
} from "@/src/features/auth/types/profile.types";

export const authService = {
  login: async (
    payload: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    const response =
      await authApi.login(
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

  getProfile:
    async (): Promise<ProfileResponseDto> => {
      return authApi.getProfile();
    },

  logout:
    async (): Promise<void> => {
      try {
        await authApi.logout();
      } finally {
        TokenStorage.clear();
      }
    },
};