import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { Permission } from '@modules/branch-user/domain/enums/permission.enum';

export interface BranchAuthUser {
  sub: string;
  sessionId: string;
  branchId: string;
  email: string;
  role: BranchUserRole;
  permissions: Permission[];
}

interface BranchAuthenticatedRequest extends Request {
  user?: BranchAuthUser;
}

export const CurrentBranchUser =
  createParamDecorator(
    (
      _: unknown,
      ctx: ExecutionContext,
    ): BranchAuthUser => {
      const request = ctx
        .switchToHttp()
        .getRequest<BranchAuthenticatedRequest>();

      const user = request.user;

      if (!user) {
        throw new Error(
          'Branch user not found in request (BranchJwtAuthGuard missing?)',
        );
      }

      return user;
    },
  );
