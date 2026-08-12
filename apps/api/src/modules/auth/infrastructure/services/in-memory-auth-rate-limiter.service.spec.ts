import { InMemoryAuthRateLimiterService } from './in-memory-auth-rate-limiter.service';
import { RateLimitError } from '../../application/errors/rate-limit.error';

describe('InMemoryAuthRateLimiterService', () => {
  it('allows attempts under the limit', () => {
    const limiter = new InMemoryAuthRateLimiterService();

    expect(() =>
      limiter.consume({
        key: 'login:test',
        maxAttempts: 3,
        windowMs: 60_000,
      }),
    ).not.toThrow();
  });

  it('throws RateLimitError after max attempts', () => {
    const limiter = new InMemoryAuthRateLimiterService();

    limiter.consume({ key: 'login:x', maxAttempts: 2, windowMs: 60_000 });
    limiter.consume({ key: 'login:x', maxAttempts: 2, windowMs: 60_000 });

    expect(() =>
      limiter.consume({ key: 'login:x', maxAttempts: 2, windowMs: 60_000 }),
    ).toThrow(RateLimitError);
  });
});
