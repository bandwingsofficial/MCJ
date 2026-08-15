import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

export const BULK_TRAINER_MAX_BATCH_SIZE = 100;

export function parseBulkTrainerIds(
  trainerIds: string[] | undefined | null,
): string[] {
  if (!trainerIds || trainerIds.length === 0) {
    throw new ValidationError(
      'At least one trainer id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const uniqueIds = [
    ...new Set(
      trainerIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    throw new ValidationError(
      'At least one valid trainer id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (uniqueIds.length > BULK_TRAINER_MAX_BATCH_SIZE) {
    throw new ValidationError(
      `Cannot process more than ${BULK_TRAINER_MAX_BATCH_SIZE} trainers at once`,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  return uniqueIds;
}
