// application/errors/validation.error.ts

import { AppError } from './app-errors';

export class ValidationError extends AppError {
  constructor(
    message: string,
    code: string = 'VALIDATION_ERROR',
    meta?: Record<string, any>, // 🔥 NEW
    statusCode = 400,
  ) {
    super(message, code, statusCode, meta); // 🔥 pass meta
  }
}
