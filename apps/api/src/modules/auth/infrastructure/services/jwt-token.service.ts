// infrastructure/services/jwt-token.service.ts

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import type {
  TokenPort,
  TokenPair,
  AccessTokenPayload,
  RefreshTokenPayload,
  MfaTokenPayload,
  BranchUserAccessTokenPayload,
  BranchUserRefreshTokenPayload,
} from '../../application/ports/token.port';

import type { Role } from '../../domain/enums/role.enum';
import type { BranchUserRole } from '../../../branch-user/domain/enums/branch-user-role.enum';
import type { Permission } from '../../../branch-user/domain/enums/permission.enum';

export class JwtTokenService implements TokenPort {
  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly accessTokenTtl = 15 * 60; // seconds (15 min)
  private readonly refreshTokenTtl = 7 * 24 * 60 * 60; // seconds (7 days)
  private readonly mfaTokenTtl = 5 * 60; // 5 min

  // =====================
  // 🔐 GENERATE TOKENS
  // =====================

  async generateTokenPair(params: {
    userId: string;
    sessionId: string;
    email: string;
    role: Role;
  }): Promise<TokenPair> {
    const now = Date.now();

    const accessTokenExpiresAt = new Date(now + this.accessTokenTtl * 1000);
    const refreshTokenExpiresAt = new Date(now + this.refreshTokenTtl * 1000);

    const accessPayload: AccessTokenPayload = {
      sub: params.userId,
      sessionId: params.sessionId,
      email: params.email,
      role: params.role,
      typ: 'access',
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: params.userId,
      sessionId: params.sessionId,
      typ: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.requireSecret('JWT_ACCESS_SECRET'),
        expiresIn: this.accessTokenTtl,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.requireSecret('JWT_REFRESH_SECRET'),
        expiresIn: this.refreshTokenTtl,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  async generateBranchUserTokenPair(params: {
    branchUserId: string;
    sessionId: string;
    branchId: string;
    email: string;
    role: BranchUserRole;
    permissions: Permission[];
  }): Promise<TokenPair> {
    const now = Date.now();

    const accessTokenExpiresAt = new Date(now + this.accessTokenTtl * 1000);
    const refreshTokenExpiresAt = new Date(now + this.refreshTokenTtl * 1000);

    const accessPayload: BranchUserAccessTokenPayload = {
      sub: params.branchUserId,
      sessionId: params.sessionId,
      branchId: params.branchId,
      email: params.email,
      role: params.role,
      permissions: params.permissions,
      type: 'BRANCH_USER',
    };

    const refreshPayload: BranchUserRefreshTokenPayload = {
      sub: params.branchUserId,
      sessionId: params.sessionId,
      type: 'BRANCH_USER_REFRESH',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.getBranchAccessSecret(),
        expiresIn: this.accessTokenTtl,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.getBranchRefreshSecret(),
        expiresIn: this.refreshTokenTtl,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  // =====================
  // 🔐 GENERATE MFA TOKEN
  // =====================

  async generateMfaToken(params: {
    userId: string;
    email: string;
    role: Role;
  }): Promise<string> {
    const payload: MfaTokenPayload = {
      sub: params.userId,
      email: params.email,
      role: params.role,
      type: 'ADMIN_MFA',
    };

    return this.jwt.signAsync(payload, {
      secret: this.requireSecret('JWT_MFA_SECRET'),
      expiresIn: this.mfaTokenTtl,
    });
  }

  async verifyMfaToken(token: string): Promise<MfaTokenPayload> {
    const payload = await this.jwt.verifyAsync<MfaTokenPayload>(token, {
      secret: this.requireSecret('JWT_MFA_SECRET'),
    });

    if (payload.type !== 'ADMIN_MFA') {
      throw new Error('Invalid MFA token type');
    }

    return payload;
  }

  // =====================
  // 🔍 VERIFY TOKENS
  // =====================

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.requireSecret('JWT_ACCESS_SECRET'),
    });

    if (payload.typ !== 'access') {
      throw new Error('Invalid access token type');
    }

    return payload;
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.requireSecret('JWT_REFRESH_SECRET'),
    });

    if (payload.typ !== 'refresh') {
      throw new Error('Invalid refresh token type');
    }

    return payload;
  }

  async verifyBranchUserRefreshToken(
    token: string,
  ): Promise<BranchUserRefreshTokenPayload> {
    const payload =
      await this.jwt.verifyAsync<BranchUserRefreshTokenPayload>(token, {
        secret: this.getBranchRefreshSecret(),
      });

    if (payload.type !== 'BRANCH_USER_REFRESH') {
      throw new Error('Invalid branch refresh token type');
    }

    return payload;
  }

  // =====================
  // ⏳ EXPIRY HELPERS
  // =====================

  getAccessTokenExpiry(): Date {
    return new Date(Date.now() + this.accessTokenTtl * 1000);
  }

  getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + this.refreshTokenTtl * 1000);
  }

  private requireSecret(key: string): string {
    const secret = this.configService.get<string>(key);

    if (!secret) {
      throw new Error(`${key} is missing`);
    }

    return secret;
  }

  private getBranchAccessSecret(): string {
    const secret =
      this.configService.get<string>('BRANCH_JWT_ACCESS_SECRET') ??
      this.configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error(
        'BRANCH_JWT_ACCESS_SECRET or JWT_ACCESS_SECRET is missing',
      );
    }

    return secret;
  }

  private getBranchRefreshSecret(): string {
    const secret =
      this.configService.get<string>('BRANCH_JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error(
        'BRANCH_JWT_REFRESH_SECRET or JWT_REFRESH_SECRET is missing',
      );
    }

    return secret;
  }
}
