// application/errors/unauthorized.error.ts

import { AppError } from './app-error';

export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    code: string = 'UNAUTHORIZED',
    meta?: Record<string, unknown>,
  ) {
    super(message, code, 401, meta);
  }
}
