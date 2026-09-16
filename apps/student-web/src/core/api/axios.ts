import axios from "axios";

import { env } from "@/src/core/config/env";
import { requestInterceptor } from "@/src/core/interceptors/request.interceptor";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(requestInterceptor);

export const refreshClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
