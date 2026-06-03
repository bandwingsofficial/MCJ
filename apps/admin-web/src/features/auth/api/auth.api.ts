// src/features/auth/api/auth.api.ts

import { apiClient } from "@/src/core/api/axios";
import {
  ProfileResponseDto,
} from "@/src/features/auth/types/profile.types";

import {
  LoginRequestDto,
  LoginResponseDto,
  VerifyTotpRequestDto,
  VerifyTotpResponseDto,
} from "@/src/features/auth/types/auth.types";

export const authApi = {
  login: async (
    payload: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    const response =
      await apiClient.post<LoginResponseDto>(
        "/admin/auth/login",
        payload
      );

    return response.data;
  },

  verifyTotp: async (
    payload: VerifyTotpRequestDto
  ): Promise<VerifyTotpResponseDto> => {
    const response =
      await apiClient.post<VerifyTotpResponseDto>(
        "/admin/auth/verify-totp",
        payload
      );

    return response.data;
  },
  getProfile: async (): Promise<ProfileResponseDto> => {
  const response =
    await apiClient.get<ProfileResponseDto>(
      "/auth/me"
    );

  return response.data;
},

logout: async (): Promise<void> => {
  await apiClient.post(
    "/auth/logout"
  );
},
};