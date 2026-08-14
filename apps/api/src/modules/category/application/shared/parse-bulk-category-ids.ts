import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export const BULK_CATEGORY_MAX_BATCH_SIZE = 100;

export function parseBulkCategoryIds(
  categoryIds: string[] | undefined | null,
): string[] {
  if (!categoryIds || categoryIds.length === 0) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'At least one category id is required',
      400,
    );
  }

  const uniqueIds = [
    ...new Set(
      categoryIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'At least one valid category id is required',
      400,
    );
  }

  if (uniqueIds.length > BULK_CATEGORY_MAX_BATCH_SIZE) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      `Cannot process more than ${BULK_CATEGORY_MAX_BATCH_SIZE} categories at once`,
      400,
    );
  }

  return uniqueIds;
}
