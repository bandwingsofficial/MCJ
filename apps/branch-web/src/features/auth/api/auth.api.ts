// src/features/auth/api/auth.api.ts

import { apiClient } from "@/src/core/api/axios";

import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from "@/src/features/auth/types/auth.types";

import {
  ProfileResponseDto,
} from "@/src/features/auth/types/profile.types";

export const authApi = {
  login: async (
    payload: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    const response =
      await apiClient.post<LoginResponseDto>(
        "/branch-auth/login",
        payload
      );

    return response.data;
  },

  getProfile: async (): Promise<ProfileResponseDto> => {
    const response =
      await apiClient.get<ProfileResponseDto>(
        "/branch-auth/me"
      );

    return response.data;
  },

  refresh: async (
    payload: RefreshTokenRequestDto
  ): Promise<RefreshTokenResponseDto> => {
    const response =
      await apiClient.post<RefreshTokenResponseDto>(
        "/branch-auth/refresh",
        payload
      );

    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(
      "/branch-auth/logout"
    );
  },
};