// src/core/interceptors/request.interceptor.ts

import type { InternalAxiosRequestConfig } from "axios";

import { tokenStorage } from "@/src/core/storage/token-storage";

export function requestInterceptor(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  const accessToken =
    tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return config;
}