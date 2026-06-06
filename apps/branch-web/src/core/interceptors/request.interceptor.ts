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
      const token =
        TokenStorage.getAccessToken();

      if (
        token &&
        config.headers
      ) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    },

    (error) =>
      Promise.reject(error)
  );
};