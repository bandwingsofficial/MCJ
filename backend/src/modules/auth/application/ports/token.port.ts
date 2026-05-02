// application/ports/token.port.ts

import { Role } from '../../domain/enums/role.enum';

// 🔥 ACCESS TOKEN (used in every request)
export interface AccessTokenPayload {
  sub: string;        // userId
  sessionId: string;  // 🔥 session binding (CRITICAL)

  // 🔥 minimal identity (useful for guards / RBAC)
  email: string;
  role: Role;
}

// 🔥 REFRESH TOKEN (kept minimal for security)
export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
}

// 🔐 Token pair
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

// 🔌 Port
export interface TokenPort {
  // 🔐 Generate tokens
  generateTokenPair(payload: {
    userId: string;
    sessionId: string;
    email: string; // 🔥 added
    role: Role;    // 🔥 added
  }): Promise<TokenPair>;

  // 🔍 Verify tokens
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;

  // ⏳ Expiry helpers
  getAccessTokenExpiry(): Date;
  getRefreshTokenExpiry(): Date;
}