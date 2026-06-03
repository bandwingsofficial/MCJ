// src/core/types/api-response.types.ts

export interface ApiSuccessResponse<T> {
  success: true;

  message: string;

  data: T;
}

export interface ApiErrorResponse {
  success: false;

  code: string;

  message: string;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;