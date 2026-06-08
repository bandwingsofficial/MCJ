// src/core/config/env.ts

const requiredEnv = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
};

Object.entries(requiredEnv).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

export const env = {
  API_BASE_URL: requiredEnv.API_BASE_URL,
} as const;