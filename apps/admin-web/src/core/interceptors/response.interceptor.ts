// src/core/interceptors/response.interceptor.ts

import { AxiosError, AxiosInstance } from "axios";

/**
 * Pass through Axios errors so callers can inspect status/code.
 * Friendly messages are mapped in getErrorMessage / UI layers.
 */
export const setupResponseInterceptor = (api: AxiosInstance): void => {
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(error)
  );
};
