import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class BranchNotFoundException extends BaseException {
  constructor(branchId: string) {
    super(
      ERROR_CODES.BRANCH_NOT_FOUND,
      `Branch not found: ${branchId}`,
      404,
    );
  }
}
