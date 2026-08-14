import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

export const BULK_BRANCH_MAX_BATCH_SIZE = 100;

export function parseBulkBranchIds(
  branchIds: string[] | undefined | null,
): string[] {
  if (!branchIds || branchIds.length === 0) {
    throw new ValidationError(
      'At least one branch id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const uniqueIds = [
    ...new Set(
      branchIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    throw new ValidationError(
      'At least one valid branch id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (uniqueIds.length > BULK_BRANCH_MAX_BATCH_SIZE) {
    throw new ValidationError(
      `Cannot process more than ${BULK_BRANCH_MAX_BATCH_SIZE} branches at once`,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  return uniqueIds;
}
