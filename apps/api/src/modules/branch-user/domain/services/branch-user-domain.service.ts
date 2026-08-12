import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { BranchUser } from '../entities/branch-user.entity';

export class BranchUserDomainService {
  ensureExists(
    branchUser: BranchUser | null,
  ): asserts branchUser is BranchUser {
    if (!branchUser) {
      throw new BaseException(
        ERROR_CODES.BRANCH_USER_NOT_FOUND,
        'Branch user not found',
        404,
      );
    }
  }

  ensureDoesNotExist(
    branchUser: BranchUser | null,
    field: 'email' | 'phone',
  ): void {
    if (branchUser) {
      throw new BaseException(
        ERROR_CODES.BRANCH_USER_ALREADY_EXISTS,
        `Branch user ${field} already exists`,
        409,
        {
          field,
        },
      );
    }
  }

  ensureBranchExists(
    exists: boolean,
  ): void {
    if (!exists) {
      throw new BaseException(
        ERROR_CODES.BRANCH_NOT_FOUND,
        'Branch not found',
        404,
      );
    }
  }

}
