import { UserRole } from "../store/auth.store";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  requiresMfa: boolean;
  mfaToken: string;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  data: LoginData;
}

export interface VerifyTotpRequestDto {
  mfaToken: string;
  totpCode: string;
  clientType?: "ADMIN_WEB" | "WEB" | "IOS" | "ANDROID";
}

export interface VerifyTotpData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sessionId: string;
  mfaVerified: boolean;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface VerifyTotpResponseDto {
  success: boolean;
  message: string;
  data: VerifyTotpData;
}
