// src/features/auth/services/auth.service.ts

import { authApi } from "@/src/features/auth/api/auth.api";
import { TokenStorage } from "@/src/core/storage/token-storage";
import { AuthStorage } from "@/src/features/auth/utils/auth-storage";
import { clearAuthCaches } from "@/src/features/auth/utils/clear-auth-caches";

import {
  LoginRequestDto,
  LoginResponseDto,
  VerifyTotpRequestDto,
  VerifyTotpResponseDto,
} from "@/src/features/auth/types/auth.types";
import { ListSessionsResponseDto } from "@/src/features/auth/types/session.types";
import { ProfileResponseDto } from "@/src/features/auth/types/profile.types";

const AUTH_SYNC_KEY = "mcj_admin_auth_sync";

export const authService = {
  login: async (
    payload: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    return authApi.login(payload);
  },

  verifyTotp: async (
    payload: VerifyTotpRequestDto
  ): Promise<VerifyTotpResponseDto> => {
    const response = await authApi.verifyTotp(payload);

    TokenStorage.setAccessToken(response.data.accessToken);
    TokenStorage.setRefreshToken(response.data.refreshToken);
    authService.broadcastAuthChange("login");

    return response;
  },

  getProfile: async (): Promise<ProfileResponseDto> => {
    return authApi.getProfile();
  },

  listSessions: async (): Promise<ListSessionsResponseDto> => {
    return authApi.listSessions();
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await authApi.revokeSession(sessionId);
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      authService.clearLocalAuth();
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await authApi.logoutAll();
    } finally {
      authService.clearLocalAuth();
    }
  },

  clearLocalAuth: (): void => {
    TokenStorage.clear();
    AuthStorage.clearMfaToken();
    clearAuthCaches();
    authService.broadcastAuthChange("logout");
  },

  broadcastAuthChange: (action: "login" | "logout"): void => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        AUTH_SYNC_KEY,
        JSON.stringify({ action, at: Date.now() })
      );
    } catch {
      // ignore quota / private mode
    }
  },

  AUTH_SYNC_KEY,
};
