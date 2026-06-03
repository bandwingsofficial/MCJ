// src/core/api/axios.ts

import axios from "axios";

import { env } from "@/src/core/config/env";

import { setupRequestInterceptor } from "@/src/core/interceptors/request.interceptor";

import { setupResponseInterceptor } from "@/src/core/interceptors/response.interceptor";

import { setupRefreshInterceptor } from "@/src/core/interceptors/refresh.interceptor";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,

  timeout: 30000,

  headers: {
    "Content-Type":
      "application/json",
  },
});

setupRequestInterceptor(
  apiClient
);

setupResponseInterceptor(
  apiClient
);

setupRefreshInterceptor(
  apiClient
);