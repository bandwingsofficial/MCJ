"use client";

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// ==============================
// API BASE URL
// ==============================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

// ==============================
// AXIOS INSTANCE
// ==============================

export const apiClient: AxiosInstance =
  axios.create({
    baseURL: API_BASE_URL,

    // 🔥 REQUIRED for cookies
    withCredentials: true,

    headers: {
      "Content-Type": "application/json",
    },
  });

// ==============================
// REQUEST INTERCEPTOR
// ==============================

apiClient.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ) => {
    // 🔥 browser only
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("accessToken");

      // 🔥 attach bearer token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    // ==========================
    // UNAUTHORIZED
    // ==========================

    if (error.response?.status === 401) {
      console.warn(
        "Unauthorized - session expired"
      );

      // 🔥 optional cleanup
      if (typeof window !== "undefined") {
        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "refreshToken"
        );
      }
    }

    return Promise.reject(error);
  }
);