// src/core/api/axios.ts

import axios from "axios";

import { env } from "@/src/core/config/env";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});