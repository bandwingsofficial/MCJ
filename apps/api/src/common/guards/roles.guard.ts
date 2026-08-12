import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

interface RoleAuthenticatedRequest extends Request {
  user?: {
    role?: BranchUserRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const roles =
      this.reflector.getAllAndOverride<BranchUserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!roles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RoleAuthenticatedRequest>();

    if (
      !request.user?.role ||
      !roles.includes(request.user.role)
    ) {
      throw new ForbiddenException(
        'Role access denied',
      );
    }

    return true;
  }
}
