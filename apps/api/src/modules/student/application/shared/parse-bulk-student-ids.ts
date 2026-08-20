import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

export const BULK_STUDENT_MAX_SIZE = 100;

export function parseBulkStudentIds(
  studentIds: string[] | undefined | null,
): string[] {
  if (!studentIds || studentIds.length === 0) {
    throw new ValidationError(
      'At least one student id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const uniqueIds = [
    ...new Set(
      studentIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    throw new ValidationError(
      'At least one valid student id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (uniqueIds.length > BULK_STUDENT_MAX_SIZE) {
    throw new ValidationError(
      `Cannot process more than ${BULK_STUDENT_MAX_SIZE} students at once`,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  return uniqueIds;
}
