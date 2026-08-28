import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '@modules/branch-user/domain/enums/permission.enum';
import { resolveEffectivePermissions } from '@modules/branch-user/domain/role-permissions';

// Dormant/future-ready: keep reusable permission guard out of module wiring
// until permission-based authorization is enabled.
interface PermissionAuthenticatedRequest
  extends Request {
  user?: {
    role?: string;
    permissions?: Permission[];
  };
}

@Injectable()
export class PermissionsGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const permissions =
      this.reflector.getAllAndOverride<Permission[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!permissions?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<PermissionAuthenticatedRequest>();

    if (request.user?.role === 'BRANCH_MANAGER') {
      return true;
    }

    const userPermissions = resolveEffectivePermissions(
      request.user?.role,
      request.user?.permissions,
    );

    const allowed = permissions.every(
      (permission) =>
        userPermissions.includes(permission),
    );

    if (!allowed) {
      throw new ForbiddenException(
        'Permission denied',
      );
    }

    return true;
  }
}
