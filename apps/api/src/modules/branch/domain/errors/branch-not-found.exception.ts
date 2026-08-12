// src/modules/branch/domain/errors/branch-not-found.exception.ts

import { ERROR_CODES } from '@/common/constants/error-codes';
import { NotFoundException } from '@/common/exceptions/not-found.exception';

export class BranchNotFoundException extends NotFoundException {
  constructor(branchId?: string) {
    super(
      ERROR_CODES.BRANCH_NOT_FOUND,
      'Branch not found',
      {
        branchId,
      },
    );
  }
}
