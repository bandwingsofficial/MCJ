import {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { apiClient } from "@/src/core/api/axios";

import { refreshAccessToken } from "@/src/core/interceptors/refresh.interceptor";
import { redirectToLoginIfNeeded } from "@/src/features/auth/utils/auth-session.utils";

import type { ApiErrorResponse } from "@/src/core/types/api-error.types";

interface RetryRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export async function responseErrorInterceptor(
  error: AxiosError<ApiErrorResponse>
) {
  const originalRequest =
    error.config as RetryRequestConfig;

  const status =
    error.response?.status;

  const code =
    error.response?.data?.code;

  const url = 
    originalRequest?.url || "";

  // CRITICAL: Do not intercept or try to refresh tokens for public auth endpoints
  if (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  ) {
    return Promise.reject(error);
  }

  if (
    code ===
      "TOKEN_REUSE_DETECTED" ||
    code === "SESSION_REVOKED" ||
    code === "SESSION_EXPIRED"
  ) {
    redirectToLoginIfNeeded();

    return Promise.reject(error);
  }

  // Do not force-logout on generic INVALID_TOKEN before attempting refresh;
  // expired/invalid access tokens are handled via the 401 refresh path below.
  if (
    code === "INVALID_TOKEN" &&
    status !== 401
  ) {
    redirectToLoginIfNeeded();

    return Promise.reject(error);
  }

  if (
    status === 401 &&
    !originalRequest._retry
  ) {
    originalRequest._retry = true;

    try {
      const accessToken =
        await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return apiClient(
        originalRequest
      );
    } catch (refreshError) {
      redirectToLoginIfNeeded();

      return Promise.reject(
        refreshError
      );
    }
  }

  return Promise.reject(error);
}