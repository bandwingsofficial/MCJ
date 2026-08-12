import { BaseException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes';

export class ValidationException extends BaseException {
  constructor(
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    super(
      ERROR_CODES.VALIDATION_ERROR,
      message,
      400,
      metadata,
    );
  }
}