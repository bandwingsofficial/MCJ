import { RefreshTokenHandler } from './refresh-token.handler';
import { RefreshTokenCommand } from './refresh-token.command';
import { ERROR_CODES } from '../../domain/errors/error-codes';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { Session } from '../../domain/entities/session.entity';
import { DeviceType } from '../../domain/enums/device-type.enum';
import { Role } from '../../domain/enums/role.enum';
import { AccountStatus } from '../../domain/enums/account-status.enum';
import { User } from '../../domain/entities/user.entity';
import { hashToken } from '../utils/token.util';

describe('RefreshTokenHandler', () => {
  const refreshToken = 'current-refresh-token';
  const refreshHash = hashToken(refreshToken);

  const makeSession = (overrides?: Partial<{ hash: string; userId: string }>) =>
    Session.create({
      id: 'session-1',
      userId: overrides?.userId ?? 'user-1',
      refreshTokenHash: overrides?.hash ?? refreshHash,
      deviceType: DeviceType.WEB,
      expiresAt: new Date(Date.now() + 60_000),
    });

  const makeUser = () =>
    User.reconstitute({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hash',
      phone: null,
      role: Role.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      mfaEnabled: false,
      mfaSecret: null,
      mfaVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const buildHandler = (deps: {
    session?: Session | null;
    rotateResult?: boolean;
    user?: User | null;
  }) => {
    const sessionRepo = {
      findById: jest.fn().mockResolvedValue(deps.session ?? null),
      revokeAllByUserId: jest.fn().mockResolvedValue(undefined),
      rotateIfHashMatches: jest
        .fn()
        .mockResolvedValue(deps.rotateResult ?? true),
      update: jest.fn(),
    };

    const userRepo = {
      findById: jest.fn().mockResolvedValue(deps.user ?? makeUser()),
    };

    const auditRepo = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    const tokenPort = {
      verifyRefreshToken: jest.fn().mockResolvedValue({
        sub: 'user-1',
        sessionId: 'session-1',
        typ: 'refresh',
      }),
      generateTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        accessTokenExpiresAt: new Date(Date.now() + 15_000),
        refreshTokenExpiresAt: new Date(Date.now() + 60_000),
      }),
    };

    const handler = new RefreshTokenHandler(
      sessionRepo as never,
      userRepo as never,
      auditRepo as never,
      tokenPort as never,
    );

    return { handler, sessionRepo, userRepo, auditRepo, tokenPort };
  };

  it('rotates refresh token and returns a new pair', async () => {
    const { handler, sessionRepo, tokenPort } = buildHandler({
      session: makeSession(),
      rotateResult: true,
    });

    const result = await handler.execute(
      new RefreshTokenCommand(refreshToken, '127.0.0.1', 'Chrome'),
    );

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(sessionRepo.rotateIfHashMatches).toHaveBeenCalled();
    expect(tokenPort.generateTokenPair).toHaveBeenCalled();
  });

  it('detects refresh reuse and revokes all sessions', async () => {
    const { handler, sessionRepo } = buildHandler({
      session: makeSession({ hash: hashToken('old-token') }),
    });

    await expect(
      handler.execute(
        new RefreshTokenCommand(refreshToken, '127.0.0.1', 'Chrome'),
      ),
    ).rejects.toMatchObject({
      code: ERROR_CODES.TOKEN_REUSE_DETECTED,
    });

    expect(sessionRepo.revokeAllByUserId).toHaveBeenCalledWith('user-1');
  });

  it('rejects ownership mismatch', async () => {
    const { handler, sessionRepo } = buildHandler({
      session: makeSession({ userId: 'other-user' }),
    });

    await expect(
      handler.execute(
        new RefreshTokenCommand(refreshToken, '127.0.0.1', 'Chrome'),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(sessionRepo.revokeAllByUserId).toHaveBeenCalledWith('user-1');
  });
});
