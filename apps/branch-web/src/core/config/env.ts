// src/core/config/env.ts

const requiredEnv = {
  apiBaseUrl:
    process.env
      .NEXT_PUBLIC_API_BASE_URL,
};

Object.entries(
  requiredEnv
).forEach(
  ([key, value]) => {
    if (!value) {
      throw new Error(
        `Missing environment variable: ${key}`
      );
    }
  }
);

export const env = {
  apiBaseUrl:
    requiredEnv.apiBaseUrl,
} as const;