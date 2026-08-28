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
    if (!branchUser) {
      return;
    }

    if (field === 'email') {
      throw new BaseException(
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        branchUser.isDeleted
          ? 'A user with this email already exists.'
          : 'An active user already exists with this email.',
        409,
        {
          field,
        },
      );
    }

    throw new BaseException(
      ERROR_CODES.PHONE_ALREADY_EXISTS,
      branchUser.isDeleted
        ? 'A user with this phone number already exists.'
        : 'An active user already exists with this phone number.',
      409,
      {
        field,
      },
    );
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
