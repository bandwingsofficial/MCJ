import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import type { BranchUserAccessTokenPayload } from '../../../auth/application/ports/token.port';
import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

@Injectable()
export class BranchJwtStrategy extends PassportStrategy(
  Strategy,
  'branch-jwt',
) {
  constructor(
    configService: ConfigService,

    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,
  ) {
    const secret =
      configService.get<string>(
        'BRANCH_JWT_ACCESS_SECRET',
      ) ??
      configService.get<string>(
        'JWT_ACCESS_SECRET',
      );

    if (!secret) {
      throw new Error(
        'BRANCH_JWT_ACCESS_SECRET or JWT_ACCESS_SECRET is not defined',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(
    payload: BranchUserAccessTokenPayload,
  ) {
    if (
      !payload?.sub ||
      !payload?.sessionId ||
      !payload?.branchId ||
      payload.type !== 'BRANCH_USER'
    ) {
      throw new UnauthorizedException(
        'Invalid token payload',
      );
    }

    const validRole = Object.values(
      BranchUserRole,
    ).includes(payload.role);

    const validPermissions =
      Array.isArray(payload.permissions) &&
      payload.permissions.every((permission) =>
        Object.values(Permission).includes(
          permission,
        ),
      );

    if (!validRole || !validPermissions) {
      throw new UnauthorizedException(
        'Invalid token claims',
      );
    }

    const branchUser =
      await this.branchUserRepo.findById(
        payload.sub,
      );

    if (!branchUser) {
      throw new UnauthorizedException(
        'Branch user session is not active',
      );
    }

    try {
      branchUser.canLogin();
    } catch {
      throw new UnauthorizedException(
        'Branch user session is not active',
      );
    }

    if (payload.branchId !== branchUser.branchId) {
      throw new UnauthorizedException(
        'Invalid branch token',
      );
    }

    return {
      sub: payload.sub,
      sessionId: payload.sessionId,
      branchId: branchUser.branchId,
      email: branchUser.email.getValue(),
      role: branchUser.role,
      permissions: branchUser.permissions,
    };
  }
}
