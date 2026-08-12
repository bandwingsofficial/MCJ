import { DeviceType } from '../enums/device-type.enum';
import { Session } from './session.entity';
import { ERROR_CODES } from '../errors/error-codes';
import { DomainError } from '../errors/domain.error';

describe('Session entity', () => {
  const future = () => new Date(Date.now() + 60_000);

  const createSession = () =>
    Session.create({
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'hash-v1',
      userAgent: 'Chrome',
      ipAddress: '127.0.0.1',
      deviceType: DeviceType.WEB,
      expiresAt: future(),
    });

  it('creates an active session', () => {
    const session = createSession();

    expect(session.isActive()).toBe(true);
    expect(session.isOwnedBy('user-1')).toBe(true);
    expect(session.canBeUsed()).toBe(true);
  });

  it('rotates refresh hash and expiry', () => {
    const session = createSession();
    const nextExpiry = new Date(Date.now() + 120_000);

    session.rotate('hash-v2', nextExpiry);

    expect(session.refreshTokenHash).toBe('hash-v2');
    expect(session.expiresAt).toEqual(nextExpiry);
    expect(session.lastUsedAt).toBeTruthy();
  });

  it('rejects rotation after revoke', () => {
    const session = createSession();
    session.revoke();

    expect(() => session.rotate('hash-v2', future())).toThrow(DomainError);

    try {
      session.rotate('hash-v2', future());
    } catch (error) {
      expect((error as DomainError).code).toBe(ERROR_CODES.SESSION_REVOKED);
    }
  });

  it('rejects use when expired', () => {
    const session = Session.reconstitute({
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'hash-v1',
      userAgent: null,
      ipAddress: null,
      deviceType: DeviceType.UNKNOWN,
      fingerprint: null,
      isRevoked: false,
      revokedAt: null,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
    });

    expect(session.isActive()).toBe(false);
    expect(() => session.canBeUsed()).toThrow(DomainError);
  });

  it('revoke is idempotent', () => {
    const session = createSession();
    session.revoke();
    const revokedAt = session.revokedAt;

    session.revoke();

    expect(session.isRevoked).toBe(true);
    expect(session.revokedAt).toEqual(revokedAt);
  });
});
