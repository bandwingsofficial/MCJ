// infrastructure/services/jwt-token.service.ts

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  TokenPort,
  TokenPair,
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../application/ports/token.port';

import { Role } from '../../domain/enums/role.enum';

export class JwtTokenService implements TokenPort {
  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService, // 🔥 FIXED
  ) {}

  // 🔥 centralized config
  private readonly accessTokenTtl = 15 * 60; // seconds (15 min)
  private readonly refreshTokenTtl = 7 * 24 * 60 * 60; // seconds (7 days)

  // =====================
  // 🔐 GENERATE TOKENS
  // =====================

  async generateTokenPair(params: {
    userId: string;
    sessionId: string;
    email: string; // 🔥 REQUIRED
    role: Role;    // 🔥 REQUIRED
  }): Promise<TokenPair> {
    const now = Date.now();

    const accessTokenExpiresAt = new Date(
      now + this.accessTokenTtl * 1000,
    );
    const refreshTokenExpiresAt = new Date(
      now + this.refreshTokenTtl * 1000,
    );

    const accessPayload: AccessTokenPayload = {
      sub: params.userId,
      sessionId: params.sessionId,
      email: params.email, // 🔥 FIXED
      role: params.role,   // 🔥 FIXED
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: params.userId,
      sessionId: params.sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.accessTokenTtl,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
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
  // 🔍 VERIFY TOKENS
  // =====================

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwt.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
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
}