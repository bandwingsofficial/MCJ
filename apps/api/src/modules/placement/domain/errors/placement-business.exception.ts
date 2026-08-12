import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class PlacementNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.PLACEMENT_NOT_FOUND,
      'Placement not found.',
      404,
    );
  }
}

export class PlacementAlreadyExistsException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.PLACEMENT_ALREADY_EXISTS,
      'Placement already exists for this application.',
      409,
    );
  }
}
