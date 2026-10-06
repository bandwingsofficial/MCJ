import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'crypto';

import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/common/filters/app-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { BrevoEmailService } from '../src/infrastructure/email/brevo-email.service';

/**
 * HTTP E2E auth lifecycle. Requires a reachable DATABASE_URL.
 * Skips the suite when the database is unavailable.
 */
describe('Auth lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let dbReady = false;

  const email = `e2e_${randomUUID().slice(0, 8)}@example.com`;
  const password = 'Password123!';

  let lastRegistrationOtp: string | null = null;

  const brevoEmailMock: Pick<
    BrevoEmailService,
    'sendEmailVerificationOtp' | 'sendPasswordResetEmail'
  > = {
    sendEmailVerificationOtp: async (input) => {
      lastRegistrationOtp = input.otp;
    },
    sendPasswordResetEmail: async () => undefined,
  };

  const unwrapData = <T extends Record<string, unknown>>(body: any): T => {
    const layer = body?.data ?? body;
    return (layer?.data ?? layer) as T;
  };

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(BrevoEmailService)
        .useValue(brevoEmailMock)
        .compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalFilters(new AppExceptionFilter());
      app.useGlobalInterceptors(new ResponseInterceptor());
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();

      prisma = app.get(PrismaService);
      await prisma.$queryRaw`SELECT 1`;
      dbReady = true;
    } catch (error) {
      dbReady = false;
      // eslint-disable-next-line no-console
      console.warn(
        'Skipping auth e2e: database unavailable',
        error instanceof Error ? error.message : error,
      );
    }
  });

  afterAll(async () => {
    if (dbReady && prisma) {
      await prisma.emailVerificationChallenge
        .deleteMany({ where: { email } })
        .catch(() => undefined);
      await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    }
    if (app) {
      await app.close();
    }
  });

  const requireDb = () => dbReady;

  const registerWithVerifiedEmail = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    lastRegistrationOtp = null;

    const sendOtp = await request(app.getHttpServer())
      .post('/auth/register/email-verification/send')
      .send({ email: payload.email });

    expect([200, 201]).toContain(sendOtp.status);
    expect(lastRegistrationOtp).toMatch(/^\d{6}$/);

    const verifyOtp = await request(app.getHttpServer())
      .post('/auth/register/email-verification/verify')
      .send({ email: payload.email, otp: lastRegistrationOtp });

    expect([200, 201]).toContain(verifyOtp.status);

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload);

    expect([200, 201]).toContain(register.status);
  };

  it('register → login → me → refresh rotation → logout', async () => {
    if (!requireDb()) {
      return;
    }

    await registerWithVerifiedEmail({
      name: 'E2E User',
      email,
      password,
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
        clientType: 'WEB',
      });

    expect([200, 201]).toContain(login.status);

    const loginData = unwrapData<{
      accessToken: string;
      refreshToken: string;
      sessionId: string;
    }>(login.body);

    expect(loginData.accessToken).toBeTruthy();
    expect(loginData.refreshToken).toBeTruthy();
    expect(loginData.sessionId).toBeTruthy();

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginData.accessToken}`);

    expect(me.status).toBe(200);
    const meData = unwrapData<{ sessionId: string }>(me.body);
    expect(meData.sessionId).toBe(loginData.sessionId);

    const sessions = await request(app.getHttpServer())
      .get('/auth/sessions')
      .set('Authorization', `Bearer ${loginData.accessToken}`);

    expect(sessions.status).toBe(200);
    const sessionPayload = unwrapData<{ sessions: Array<Record<string, unknown>> }>(
      sessions.body,
    );
    const sessionList = sessionPayload.sessions ?? [];
    expect(
      sessionList.some(
        (s) =>
          s.id === loginData.sessionId &&
          s.isCurrent === true &&
          s.clientType === 'WEB',
      ),
    ).toBe(true);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginData.refreshToken });

    expect(refresh.status).toBeLessThan(300);
    const refreshData = unwrapData<{
      accessToken: string;
      refreshToken: string;
    }>(refresh.body);

    expect(refreshData.refreshToken).toBeTruthy();
    expect(refreshData.refreshToken).not.toBe(loginData.refreshToken);
    expect(refreshData.accessToken).toBeTruthy();

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshData.accessToken}`);

    expect(logout.status).toBeLessThan(300);

    const refreshAfterLogout = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: refreshData.refreshToken });

    expect(refreshAfterLogout.status).toBe(401);
  });

  it('rejects reused refresh credentials and applies reuse policy', async () => {
    if (!requireDb()) {
      return;
    }

    const loginEmail = `e2e_reuse_${randomUUID().slice(0, 8)}@example.com`;

    await registerWithVerifiedEmail({
      name: 'Reuse User',
      email: loginEmail,
      password,
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: loginEmail,
        password,
        clientType: 'IOS',
      });

    const loginData = unwrapData<{
      accessToken: string;
      refreshToken: string;
    }>(login.body);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginData.refreshToken });

    expect(refresh.status).toBeLessThan(300);

    const replay = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginData.refreshToken });

    expect(replay.status).toBe(401);

    await prisma.emailVerificationChallenge
      .deleteMany({ where: { email: loginEmail } })
      .catch(() => undefined);
    await prisma.user.deleteMany({ where: { email: loginEmail } }).catch(() => undefined);
  });

  it('rejects protected route without token', async () => {
    if (!requireDb()) {
      return;
    }

    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
