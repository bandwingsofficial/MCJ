import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthUser } from '../decorators/current-user.decorator';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Super admin access required',
      );
    }

    return true;
  }
}
