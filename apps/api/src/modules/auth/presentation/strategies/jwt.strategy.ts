// presentation/strategies/jwt.strategy.ts

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AUTH_TOKENS } from '../../auth.tokens';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import { Role } from '../../domain/enums/role.enum';
import { UserAccountLifecycleService } from '../../../admin-user-management/application/user-account-lifecycle.service';

interface JwtPayload {
  sub: string;
  sessionId: string;
  email: string;
  role: Role;
  typ?: 'access' | 'refresh' | 'mfa';
  type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,

    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    private readonly accountLifecycle: UserAccountLifecycleService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub || !payload?.sessionId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid access token type');
    }

    if (
      payload.type === 'BRANCH_USER' ||
      payload.type === 'BRANCH_USER_REFRESH' ||
      payload.type === 'ADMIN_MFA'
    ) {
      throw new UnauthorizedException('Invalid access token type');
    }

    const session = await this.sessionRepo.findById(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (!session.isOwnedBy(payload.sub)) {
      throw new UnauthorizedException('Session does not belong to user');
    }

    if (!session.isActive()) {
      throw new UnauthorizedException('Session is not active');
    }

    try {
      await this.accountLifecycle.assertLoginAllowed(payload.sub);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }

    return {
      sub: payload.sub,
      sessionId: payload.sessionId,
      email: payload.email,
      role: payload.role,
    };
  }
}
