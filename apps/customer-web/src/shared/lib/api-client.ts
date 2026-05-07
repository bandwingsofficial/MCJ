"use client";

import axios, {
  AxiosError,
  AxiosInstance,
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

    withCredentials: true,

    headers: {
      "Content-Type":
        "application/json",
    },
  });

// ==============================
// REFRESH STATE
// ==============================

let isRefreshing = false;

let failedQueue: any[] = [];

// ==============================
// PROCESS QUEUE
// ==============================

const processQueue = (
  error: any = null
) => {
  failedQueue.forEach(
    (promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    }
  );

  failedQueue = [];
};

// ==============================
// RESPONSE INTERCEPTOR
// ==============================

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest: any =
      error.config;

    // ==========================
    // ONLY HANDLE 401
    // ==========================

    if (
      error.response?.status ===
        401 &&
      !originalRequest._retry
    ) {
      // ========================
      // ALREADY REFRESHING
      // ========================

      if (isRefreshing) {
        return new Promise(
          (
            resolve,
            reject
          ) => {
            failedQueue.push({
              resolve,
              reject,
            });
          }
        ).then(() =>
          apiClient(
            originalRequest
          )
        );
      }

      originalRequest._retry =
        true;

      isRefreshing = true;

      try {
        // ======================
        // REFRESH TOKENS
        // ======================

        await apiClient.post(
          "/auth/refresh"
        );

        processQueue();

        // ======================
        // RETRY ORIGINAL REQUEST
        // ======================

        return apiClient(
          originalRequest
        );
      } catch (
        refreshError
      ) {
        processQueue(
          refreshError
        );

        // ======================
        // FORCE LOGOUT
        // ======================

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
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);