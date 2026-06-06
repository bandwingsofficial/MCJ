export interface LoginRequestDto {
  identifier: string;
  password: string;
}

export interface BranchUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  branchId: string;
}

export interface LoginDataDto
  extends BranchUserDto {
  sessionId: string;

  accessToken: string;

  refreshToken: string;

  accessTokenExpiresAt: string;

  refreshTokenExpiresAt: string;
}

export interface LoginResponseDto {
  success: boolean;

  message: string;

  data: LoginDataDto;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenDataDto {
  accessToken: string;

  refreshToken: string;

  accessTokenExpiresAt: string;

  refreshTokenExpiresAt: string;
}

export interface RefreshTokenResponseDto {
  success: boolean;

  message: string;

  data: RefreshTokenDataDto;
}