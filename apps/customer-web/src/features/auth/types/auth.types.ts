// src/features/auth/types/auth.types.ts

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "BRANCH_ADMIN"
  | "TRAINER"
  | "STUDENT";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface UserProfile extends AuthUser {
  phone: string;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sessionId: string;
  loginType: string;
  phone: string;

  accessToken: string;
  refreshToken: string;

  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;

  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface Session {
  id: string;
  device: string;
  ipAddress: string;
  isCurrent: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface AuthState {
  user: UserProfile | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  setUser: (user: UserProfile) => void;

  clearUser: () => void;

  setLoading: (loading: boolean) => void;
}