// src/core/interceptors/refresh.interceptor.ts

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/src/core/config/env";
import { TokenStorage } from "@/src/core/storage/token-storage";
import { RefreshTokenResponseDto } from "@/src/core/types/auth.types";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AuthStorage } from "@/src/features/auth/utils/auth-storage";
import { clearAuthCaches } from "@/src/features/auth/utils/clear-auth-caches";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const AUTH_SKIP_REFRESH_PATHS = [
  "/admin/auth/login",
  "/admin/auth/verify-totp",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/jobs/company-submit",
  "/public-apply",
];

const processQueue = (
  error: Error | null,
  token: string | null
): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
      return;
    }
    promise.resolve(token ?? "");
  });
  failedQueue = [];
};

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  if (AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path))) {
    return true;
  }

  if (url.includes("/admin/")) {
    return false;
  }

  return /\/jobs(\/|\?|$)/.test(url);
};

function isPublicUnauthenticatedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/verify-totp") ||
    /^\/jobs\/[^/]+\/apply(?:\/.*)?$/.test(pathname)
  );
}

const forceLogout = (): void => {
  TokenStorage.clear();
  AuthStorage.clearMfaToken();
  clearAuthCaches();
  useAuthStore.getState().markUnauthenticated();

  if (
    typeof window !== "undefined" &&
    !isPublicUnauthenticatedPath(window.location.pathname)
  ) {
    window.location.href = "/login";
  }
};

export const setupRefreshInterceptor = (api: AxiosInstance): void => {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<unknown> => {
      const originalRequest = error.config as RetryRequestConfig | undefined;

      if (
        !originalRequest ||
        error.response?.status !== 401 ||
        originalRequest._retry ||
        shouldSkipRefresh(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      useAuthStore.getState().setStatus("REFRESHING");

      try {
        const refreshToken = TokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error("Refresh token not found");
        }

        const response = await axios.post<RefreshTokenResponseDto>(
          `${env.apiBaseUrl}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        TokenStorage.setAccessToken(accessToken);
        TokenStorage.setRefreshToken(newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (useAuthStore.getState().user) {
          useAuthStore.getState().setStatus("AUTHENTICATED");
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(
          refreshError instanceof Error
            ? refreshError
            : new Error("Refresh failed"),
          null
        );
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
