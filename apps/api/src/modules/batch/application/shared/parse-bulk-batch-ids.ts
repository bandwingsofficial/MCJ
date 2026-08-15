import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

export const BULK_BATCH_MAX_BATCH_SIZE = 100;

export function parseBulkBatchIds(
  batchIds: string[] | undefined | null,
): string[] {
  if (!batchIds || batchIds.length === 0) {
    throw new ValidationError(
      'At least one batch id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const uniqueIds = [
    ...new Set(
      batchIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    throw new ValidationError(
      'At least one valid batch id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (uniqueIds.length > BULK_BATCH_MAX_BATCH_SIZE) {
    throw new ValidationError(
      `Cannot process more than ${BULK_BATCH_MAX_BATCH_SIZE} batches at once`,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  return uniqueIds;
}
