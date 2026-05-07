// src/domains/auth/types/auth.types.ts

export interface User {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT";
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code?: string;
  data?: T;
}