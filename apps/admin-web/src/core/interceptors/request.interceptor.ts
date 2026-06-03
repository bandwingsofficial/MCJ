// src/core/interceptors/request.interceptor.ts

import {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { TokenStorage } from "@/src/core/storage/token-storage";

export const setupRequestInterceptor = (
  api: AxiosInstance
): void => {
  api.interceptors.request.use(
    (
      config: InternalAxiosRequestConfig
    ) => {
      const accessToken =
        TokenStorage.getAccessToken();

      if (accessToken) {
        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }

      return config;
    }
  );
};