// application/ports/token.port.ts

import type { Role } from '../../domain/enums/role.enum';
import type { BranchUserRole } from '../../../branch-user/domain/enums/branch-user-role.enum';
import type { Permission } from '../../../branch-user/domain/enums/permission.enum';

export type AccessTokenType = 'access';
export type RefreshTokenType = 'refresh';

// 🔥 ACCESS TOKEN (used in every request)
export interface AccessTokenPayload {
  sub: string;

  sessionId: string;

  email: string;

  role: Role;

  /** Distinguishes access tokens from refresh credentials */
  typ: AccessTokenType;
}

// 🔥 REFRESH TOKEN
export interface RefreshTokenPayload {
  sub: string;

  sessionId: string;

  /** Distinguishes refresh credentials from access tokens */
  typ: RefreshTokenType;
}

export interface BranchUserAccessTokenPayload {
  sub: string;

  sessionId: string;

  branchId: string;

  email: string;

  role: BranchUserRole;

  permissions: Permission[];

  type: 'BRANCH_USER';
}

export interface BranchUserRefreshTokenPayload {
  sub: string;

  sessionId: string;

  type: 'BRANCH_USER_REFRESH';
}

// 🔐 MFA TOKEN
export interface MfaTokenPayload {
  sub: string;

  email: string;

  role: Role;

  type: 'ADMIN_MFA';
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

    email: string;

    role: Role;
  }): Promise<TokenPair>;

  generateBranchUserTokenPair(payload: {
    branchUserId: string;

    sessionId: string;

    branchId: string;

    email: string;

    role: BranchUserRole;

    permissions: Permission[];
  }): Promise<TokenPair>;

  // 🔐 MFA TOKEN
  generateMfaToken(payload: {
    userId: string;

    email: string;

    role: Role;
  }): Promise<string>;

  // 🔍 Verify tokens
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;

  verifyBranchUserRefreshToken(
    token: string,
  ): Promise<BranchUserRefreshTokenPayload>;

  // 🔐 VERIFY MFA TOKEN
  verifyMfaToken(token: string): Promise<MfaTokenPayload>;

  // ⏳ Expiry helpers
  getAccessTokenExpiry(): Date;

  getRefreshTokenExpiry(): Date;
}
