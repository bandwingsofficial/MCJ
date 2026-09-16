// src/core/utils/get-error-message.ts

import axios from "axios";

import type { ApiErrorResponse } from "@/src/core/types/api-error.types";

export function getErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}