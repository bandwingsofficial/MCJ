// src/modules/branch/domain/services/branch-domain.service.ts

import { Branch } from '../entities/branch.entity';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { BranchStatus } from '../enums/branch-status.enum';

export class BranchDomainService {
  // =====================
  // 🔥 CROSS-ENTITY / POLICY LOGIC
  // =====================

  ensureBranchDoesNotExist(
    branch: Branch | null,
    message = 'Branch already exists',
  ): void {
    if (branch) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ALREADY_EXISTS,
        message,
        409,
      );
    }
  }

  ensureBranchCodeIsAvailable(
    exists: boolean,
  ): void {
    if (exists) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ALREADY_EXISTS,
        'Branch code already exists.',
        409,
      );
    }
  }

  ensureBranchNameIsAvailable(
    branch: Branch | null,
  ): void {
    if (branch) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ALREADY_EXISTS,
        'Branch name already exists.',
        409,
      );
    }
  }

  // =====================
  // 🔥 ASSERTION FUNCTION
  // =====================

  ensureBranchExists(
    branch: Branch | null,
  ): asserts branch is Branch {
    if (!branch) {
      throw new BaseException(
        ERROR_CODES.BRANCH_NOT_FOUND,
        'Branch not found',
        404,
      );
    }
  }

  // =====================
  // 🔥 BUSINESS RULES
  // =====================

  ensureBranchIsActive(
    branch: Branch,
  ): void {
    if (
      branch.status !==
      BranchStatus.ACTIVE
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch is not active',
        400,
        {
          branchId: branch.id,
          status: branch.status,
        },
      );
    }
  }

  ensureBranchHasLocation(
    branch: Branch,
  ): void {
    if (!branch.hasLocation()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch location is incomplete',
        400,
        {
          branchId: branch.id,
        },
      );
    }
  }

  ensureBranchHasContactInfo(
    branch: Branch,
  ): void {
    if (!branch.hasContactInfo()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch contact information is missing',
        400,
        {
          branchId: branch.id,
        },
      );
    }
  }
}