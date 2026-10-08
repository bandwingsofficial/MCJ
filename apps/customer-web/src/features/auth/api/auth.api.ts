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

  sendRegistrationEmailOtp(email: string) {
    return apiClient.post<ApiResponse<{ retryAfterSeconds?: number }>>(
      "/auth/register/email-verification/send",
      { email },
    );
  },

  verifyRegistrationEmailOtp(email: string, otp: string) {
    return apiClient.post<ApiResponse<{ verified: true }>>(
      "/auth/register/email-verification/verify",
      { email, otp },
    );
  },

  validatePasswordResetToken(token: string) {
    return apiClient.get<ApiResponse<{ valid: boolean }>>(
      "/auth/password-reset/validate",
      { params: { token } },
    );
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

  sendPasswordResetOtp(email: string) {
    return apiClient.post<ApiResponse<null>>(
      "/auth/password-reset/otp/send",
      { email },
    );
  },

  verifyPasswordResetOtp(email: string, otp: string) {
    return apiClient.post<ApiResponse<{ resetToken: string }>>(
      "/auth/password-reset/otp/verify",
      { email, otp },
    );
  },

  completePasswordResetOtp(payload: {
    resetToken: string;
    newPassword: string;
  }) {
    return apiClient.post<ApiResponse<null>>(
      "/auth/password-reset/otp/complete",
      payload,
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