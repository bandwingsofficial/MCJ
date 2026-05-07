// presentation/guards/jwt.strategy.ts

import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AUTH_TOKENS } from '../../auth.tokens';
import type { SessionRepository } from '../../domain/repositories/session.repository';

// 🔥 match your TokenPort payload
interface JwtPayload {
  sub: string;
  sessionId: string;
  email: string; // 🔥 ADDED
  role: string;  // 🔥 ADDED
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,

    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest:
  ExtractJwt.fromExtractors([
    (req: any) => {
      return req?.cookies?.accessToken;
    },
  ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // =====================
    // 1️⃣ BASIC VALIDATION
    // =====================
    if (!payload?.sub || !payload?.sessionId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // =====================
    // 2️⃣ SESSION CHECK (DB)
    // =====================
    const session = await this.sessionRepo.findById(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // 🔥 use domain instead of manual checks (cleaner)
    if (!session.isActive()) {
      throw new UnauthorizedException('Session is not active');
    }

    // =====================
    // 3️⃣ RETURN USER CONTEXT
    // =====================
    return {
      sub: payload.sub,
      sessionId: payload.sessionId,
      email: payload.email, // 🔥 ADDED
      role: payload.role,   // 🔥 ADDED
    };
  }
}