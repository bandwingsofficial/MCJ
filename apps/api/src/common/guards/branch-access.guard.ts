import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

interface BranchAccessUser {
  branchId?: string;
  role?: string;
}

interface BranchAuthenticatedRequest
  extends Request {
  user?: BranchAccessUser;
}

@Injectable()
export class BranchAccessGuard
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request = context
      .switchToHttp()
      .getRequest<BranchAuthenticatedRequest>();

    const user = request.user;

    if (user?.role === 'ADMIN') {
      return true;
    }

    if (!user?.branchId) {
      throw new ForbiddenException(
        'Branch user context missing',
      );
    }

    const body = request.body as
      | Record<string, unknown>
      | undefined;

    const requestedBranchId =
      request.params.branchId ??
      (typeof body?.branchId === 'string'
        ? body.branchId
        : undefined) ??
      (typeof request.query?.branchId === 'string'
        ? request.query.branchId
        : undefined);

    if (
      requestedBranchId &&
      requestedBranchId !== user.branchId
    ) {
      throw new ForbiddenException(
        'Branch access denied',
      );
    }

    return true;
  }
}
