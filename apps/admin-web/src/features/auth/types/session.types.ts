// src/features/auth/types/session.types.ts

export type ClientType =
  | "WEB"
  | "IOS"
  | "ANDROID"
  | "ADMIN_WEB"
  | "UNKNOWN";

export interface AuthSession {
  id: string;
  clientType: ClientType;
  device: string;
  ipAddress: string | null;
  isCurrent: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
}

export interface ListSessionsResponseDto {
  success: boolean;
  message: string;
  data: {
    sessions: AuthSession[];
  };
}
