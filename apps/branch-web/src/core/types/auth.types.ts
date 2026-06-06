export interface RefreshTokenResponseDto {
  success: boolean;

  message: string;

  data: {
    accessToken: string;

    refreshToken: string;

    accessTokenExpiresAt: string;

    refreshTokenExpiresAt: string;
  };
}