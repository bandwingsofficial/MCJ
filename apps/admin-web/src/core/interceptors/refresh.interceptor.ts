// src/core/interceptors/refresh.interceptor.ts

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/src/core/config/env";

import { TokenStorage } from "@/src/core/storage/token-storage";

import { RefreshTokenResponseDto } from "@/src/core/types/auth.types";

interface RetryRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;

  reject: (error: Error) => void;
}> = [];

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

export const setupRefreshInterceptor = (
  api: AxiosInstance
): void => {
  api.interceptors.response.use(
    (response) => response,

    async (
      error: AxiosError
    ): Promise<unknown> => {
      const originalRequest =
        error.config as RetryRequestConfig;

      if (
        error.response?.status !== 401 ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(
          (resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                if (
                  originalRequest.headers
                ) {
                  originalRequest.headers.Authorization =
                    `Bearer ${token}`;
                }

                resolve(
                  api(originalRequest)
                );
              },
              reject,
            });
          }
        );
      }

      isRefreshing = true;

      try {
        const refreshToken =
          TokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error(
            "Refresh token not found"
          );
        }

        const response =
          await axios.post<RefreshTokenResponseDto>(
            `${env.apiBaseUrl}/auth/refresh`,
            {
              refreshToken,
            }
          );

        const {
          accessToken,
          refreshToken:
            newRefreshToken,
        } = response.data.data;

        TokenStorage.setAccessToken(
          accessToken
        );

        TokenStorage.setRefreshToken(
          newRefreshToken
        );

        processQueue(
          null,
          accessToken
        );

        if (
          originalRequest.headers
        ) {
          originalRequest.headers.Authorization =
            `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(
          refreshError as Error,
          null
        );

        TokenStorage.clear();

        window.location.href =
          "/admin/login";

        return Promise.reject(
          refreshError
        );
      } finally {
        isRefreshing = false;
      }
    }
  );
};