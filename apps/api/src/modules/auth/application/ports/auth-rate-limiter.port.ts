// application/ports/auth-rate-limiter.port.ts

export interface AuthRateLimiterPort {
  /**
   * Throws RateLimitError when the key exceeds maxAttempts within windowMs.
   * On success, records one attempt.
   */
  consume(params: {
    key: string;
    maxAttempts: number;
    windowMs: number;
  }): void;
}
