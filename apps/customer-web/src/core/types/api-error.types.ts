// src/core/types/api-error.types.ts

export interface ApiErrorMeta {
  retryAfter?: number;
  retryAt?: string;
  attempts?: number;
  remainingAttempts?: number;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  meta?: ApiErrorMeta;
}