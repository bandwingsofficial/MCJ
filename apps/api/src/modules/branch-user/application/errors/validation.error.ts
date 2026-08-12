import { AppError } from './app-error';

export class ValidationError extends AppError {
  constructor(
    message: string,
    code: string = 'VALIDATION_ERROR',
    meta?: Record<string, unknown>,
    statusCode = 400,
  ) {
    super(message, code, statusCode, meta);
  }
}
