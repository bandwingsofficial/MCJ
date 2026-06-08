import {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { apiClient } from "@/src/core/api/axios";
import { tokenStorage } from "@/src/core/storage/token-storage";

import { refreshAccessToken } from "@/src/core/interceptors/refresh.interceptor";

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
    "TOKEN_REUSE_DETECTED"
  ) {
    tokenStorage.clear();

    if (
      typeof window !==
      "undefined"
    ) {
      window.location.href =
        "/login";
    }

    return Promise.reject(error);
  }

  if (
    code === "INVALID_TOKEN"
  ) {
    tokenStorage.clear();

    if (
      typeof window !==
      "undefined"
    ) {
      window.location.href =
        "/login";
    }

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
      tokenStorage.clear();

      if (
        typeof window !==
        "undefined"
      ) {
        window.location.href =
          "/login";
      }

      return Promise.reject(
        refreshError
      );
    }
  }

  return Promise.reject(error);
}