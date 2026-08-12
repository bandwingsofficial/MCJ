// src/modules/branch-user/domain/errors/branch-user-not-found.exception.ts

import { ERROR_CODES } from '@/common/constants/error-codes';
import { NotFoundException } from '@/common/exceptions/not-found.exception';

export class BranchUserNotFoundException extends NotFoundException {
  constructor(branchUserId?: string) {
    super(
      ERROR_CODES.BRANCH_USER_NOT_FOUND,
      'Branch user not found',
      {
        branchUserId,
      },
    );
  }
}
