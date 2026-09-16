// src/features/auth/services/auth.service.ts

import { tokenStorage } from "@/src/core/storage/token-storage";

import { authApi } from "@/src/features/auth/api/auth.api";

import type {
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RefreshTokenResponse,
  RegisterRequest,
  UserProfile,
} from "@/src/features/auth/types/auth.types";

export const authService = {
  async register(
    payload: RegisterRequest
  ) {
    const response =
      await authApi.register(
        payload
      );

    return response.data.data;
  },

  async login(
    payload: LoginRequest
  ) {
    const response =
      await authApi.login(
        payload
      );

    const data =
      response.data.data;

    tokenStorage.setAccessToken(
      data.accessToken
    );

    tokenStorage.setRefreshToken(
      data.refreshToken
    );

    return data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken =
      tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "Refresh token not found"
      );
    }

    const response =
      await authApi.refreshToken({
        refreshToken,
      });

    const data =
      response.data.data;

    tokenStorage.setAccessToken(
      data.accessToken
    );

    tokenStorage.setRefreshToken(
      data.refreshToken
    );

    return data;
  },

  async getProfile(): Promise<UserProfile> {
    const response =
      await authApi.getProfile();

    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await authApi.logoutAll();
    } finally {
      tokenStorage.clear();
    }
  },

  async requestPasswordReset(
    payload: PasswordResetRequest
  ) {
    const response =
      await authApi.requestPasswordReset(
        payload
      );

    return response.data;
  },

  async confirmPasswordReset(
    payload: PasswordResetConfirmRequest
  ) {
    const response =
      await authApi.confirmPasswordReset(
        payload
      );

    return response.data;
  },

  async getSessions() {
    const response =
      await authApi.getSessions();

    return response.data.data;
  },

  async revokeSession(
    sessionId: string
  ) {
    const response =
      await authApi.revokeSession(
        sessionId
      );

    return response.data;
  },

  clearAuth() {
    tokenStorage.clear();
  },
};