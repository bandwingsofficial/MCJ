// application/errors/validation.error.ts

import { AppError } from './app-error';

export class ValidationError extends AppError {
  constructor(
    message: string,
    code: string = 'VALIDATION_ERROR',
    meta?: Record<string, any>, // 🔥 NEW
  ) {
    super(message, code, 400, meta); // 🔥 pass meta
  }
}