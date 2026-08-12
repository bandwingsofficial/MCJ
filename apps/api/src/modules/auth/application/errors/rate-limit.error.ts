// application/errors/rate-limit.error.ts

import { AppError } from './app-error';

export class RateLimitError extends AppError {
  constructor(
    message: string,
    code: string = 'TOO_MANY_REQUESTS',
    meta?: Record<string, unknown>,
  ) {
    super(message, code, 429, meta);
  }
}
