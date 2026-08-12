// infrastructure/services/in-memory-auth-rate-limiter.service.ts

import type { AuthRateLimiterPort } from '../../application/ports/auth-rate-limiter.port';
import { RateLimitError } from '../../application/errors/rate-limit.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

interface WindowState {
  count: number;
  resetAt: number;
}

/**
 * Process-local sliding window for auth endpoints.
 * Suitable for single-instance deploys; replace with Redis for multi-instance.
 */
export class InMemoryAuthRateLimiterService implements AuthRateLimiterPort {
  private readonly windows = new Map<string, WindowState>();

  consume(params: {
    key: string;
    maxAttempts: number;
    windowMs: number;
  }): void {
    const now = Date.now();
    const existing = this.windows.get(params.key);

    if (!existing || existing.resetAt <= now) {
      this.windows.set(params.key, {
        count: 1,
        resetAt: now + params.windowMs,
      });
      return;
    }

    if (existing.count >= params.maxAttempts) {
      const retryAfter = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      );

      throw new RateLimitError(
        'Too many authentication attempts. Please try again later.',
        ERROR_CODES.TOO_MANY_REQUESTS,
        { retryAfter },
      );
    }

    existing.count += 1;
    this.windows.set(params.key, existing);
  }
}
