// src/features/auth/api/auth.api.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  SessionsResponse,
  UserProfile,
} from "@/src/features/auth/types/auth.types";

import type { ApiResponse } from "@/src/core/types/api-response.types";
import type { RegistrationFieldAvailability } from "@/src/features/auth/types/registration-check.types";

export const authApi = {
  checkRegistrationEmail(email: string) {
    return apiClient.get<
      ApiResponse<RegistrationFieldAvailability>
    >("/auth/register/check-email", {
      params: { email },
    });
  },

  checkRegistrationPhone(phone: string) {
    return apiClient.get<
      ApiResponse<RegistrationFieldAvailability>
    >("/auth/register/check-phone", {
      params: { phone },
    });
  },

  register(
    payload: RegisterRequest
  ) {
    return apiClient.post<
      ApiResponse<RegisterResponse>
    >(
      "/auth/register",
      payload
    );
  },

  login(
    payload: LoginRequest
  ) {
    return apiClient.post<
      ApiResponse<LoginResponse>
    >(
      "/auth/login",
      payload
    );
  },

  refreshToken(
    payload: RefreshTokenRequest
  ) {
    return apiClient.post<
      ApiResponse<RefreshTokenResponse>
    >(
      "/auth/refresh",
      payload
    );
  },

  getProfile() {
    return apiClient.get<
      ApiResponse<UserProfile>
    >("/auth/me");
  },

  logout() {
    return apiClient.post<
      ApiResponse<null>
    >("/auth/logout");
  },

  logoutAll() {
    return apiClient.post<
      ApiResponse<null>
    >("/auth/logout-all");
  },

  getSessions() {
    return apiClient.get<
      ApiResponse<SessionsResponse>
    >("/auth/sessions");
  },

  revokeSession(
    sessionId: string
  ) {
    return apiClient.post<
      ApiResponse<null>
    >(
      `/auth/sessions/${sessionId}/revoke`
    );
  },

  requestPasswordReset(
    payload: PasswordResetRequest
  ) {
    return apiClient.post<
      ApiResponse<null>
    >(
      "/auth/password-reset/request",
      payload
    );
  },

  confirmPasswordReset(
    payload: PasswordResetConfirmRequest
  ) {
    return apiClient.post<
      ApiResponse<null>
    >(
      "/auth/password-reset/confirm",
      payload
    );
  },
};