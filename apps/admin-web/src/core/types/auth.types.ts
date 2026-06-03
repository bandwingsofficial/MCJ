// src/core/types/auth.types.ts

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenData {
  accessToken: string;

  refreshToken: string;

  accessTokenExpiresAt: string;

  refreshTokenExpiresAt: string;
}

export interface RefreshTokenResponseDto {
  success: boolean;

  message: string;

  data: RefreshTokenData;
}