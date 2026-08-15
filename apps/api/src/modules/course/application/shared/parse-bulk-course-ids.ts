import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

export const BULK_COURSE_MAX_BATCH_SIZE = 100;

export function parseBulkCourseIds(
  courseIds: string[] | undefined | null,
): string[] {
  if (!courseIds || courseIds.length === 0) {
    throw new ValidationError(
      'At least one course id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const uniqueIds = [
    ...new Set(
      courseIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    throw new ValidationError(
      'At least one valid course id is required',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (uniqueIds.length > BULK_COURSE_MAX_BATCH_SIZE) {
    throw new ValidationError(
      `Cannot process more than ${BULK_COURSE_MAX_BATCH_SIZE} courses at once`,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  return uniqueIds;
}
