// src/core/interceptors/refresh.interceptor.ts

import { AxiosError } from "axios";

import { refreshClient } from "@/src/core/api/axios";
import { tokenStorage } from "@/src/core/storage/token-storage";

import type { RefreshTokenResponse } from "@/src/features/auth/types/auth.types";
import type { ApiResponse } from "@/src/core/types/api-response.types";

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(
  error: Error | null,
  token?: string
) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
      return;
    }

    promise.resolve(token ?? "");
  });

  failedQueue = [];
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Refresh token not found"
    );
  }

  if (isRefreshing) {
    return new Promise(
      (resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }
    );
  }

  try {
    isRefreshing = true;

    const response =
      await refreshClient.post<
        ApiResponse<RefreshTokenResponse>
      >("/auth/refresh", {
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

    processQueue(
      null,
      data.accessToken
    );

    return data.accessToken;
  } catch (error) {
    processQueue(
      error instanceof Error
        ? error
        : new Error("Refresh failed")
    );

    tokenStorage.clear();

    throw error;
  } finally {
    isRefreshing = false;
  }
}