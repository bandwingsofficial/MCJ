// src/core/types/api-response.types.ts

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
}

export interface PaginatedResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
}