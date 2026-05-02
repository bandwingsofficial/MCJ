import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './presentation/controllers/auth.controller';

// =====================
// HANDLERS
// =====================
import { RegisterUserHandler } from './application/register/register-user.handler';
import { LoginUserHandler } from './application/login/login-user.handler';
import { RefreshTokenHandler } from './application/refresh/refresh-token.handler';
import { LogoutHandler } from './application/logout/logout.handler';
import { ListSessionsHandler } from './application/session/list-sessions.handler';
import { RevokeSessionHandler } from './application/session/revoke-session.handler';
import { LogoutAllHandler } from './application/session/logout-all.handler';

// 🔥 NEW RESET PASSWORD
import { RequestPasswordResetHandler } from './application/password-reset/request-password-reset.handler';
import { ResetPasswordHandler } from './application/password-reset/reset-password.handler';

// =====================
// REPOSITORIES
// =====================
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository';
import { PrismaAuditLogRepository } from './infrastructure/repositories/prisma-audit-log.repository';

// 🔥 NEW
import { PrismaPasswordResetRepository } from './infrastructure/repositories/prisma-password-reset.repository';

// =====================
// SERVICES
// =====================
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { UserDomainService } from './domain/services/user-domain.service';

// =====================
// INFRA
// =====================
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AUTH_TOKENS } from './auth.tokens';

// =====================
// AUTH
// =====================
import { JwtStrategy } from './presentation/guards/jwt.strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,

    // 🔥 make global (better)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_ACCESS_SECRET');

        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET is missing');
        }

        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    // =====================
    // STRATEGY + GUARD
    // =====================
    JwtStrategy,
    JwtAuthGuard,

    // =====================
    // REPOSITORIES
    // =====================
    {
      provide: AUTH_TOKENS.USER_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: AUTH_TOKENS.SESSION_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaSessionRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaAuditLogRepository(prisma),
      inject: [PrismaService],
    },

    // 🔥 NEW PASSWORD RESET REPO
    {
      provide: AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaPasswordResetRepository(prisma),
      inject: [PrismaService],
    },

    // =====================
    // SERVICES
    // =====================
    {
      provide: AUTH_TOKENS.TOKEN_PORT,
      useFactory: (jwtService: JwtService, config: ConfigService) =>
        new JwtTokenService(jwtService, config), // 🔥 FIXED
      inject: [JwtService, ConfigService],
    },

    UserDomainService,

    // =====================
    // HANDLERS
    // =====================

    {
      provide: RegisterUserHandler,
      useFactory: (userRepo, auditRepo) =>
        new RegisterUserHandler(userRepo, auditRepo),
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: LoginUserHandler,
      useFactory: (
        userRepo,
        sessionRepo,
        auditRepo,
        tokenPort,
        domainService,
      ) =>
        new LoginUserHandler(
          userRepo,
          sessionRepo,
          auditRepo,
          tokenPort,
          domainService,
        ),
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.SESSION_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
        AUTH_TOKENS.TOKEN_PORT,
        UserDomainService,
      ],
    },

    {
      provide: RefreshTokenHandler,
      useFactory: (
        sessionRepo,
        userRepo,
        auditRepo,
        tokenPort,
        domainService,
      ) =>
        new RefreshTokenHandler(
          sessionRepo,
          userRepo,
          auditRepo,
          tokenPort,
          domainService,
        ),
      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
        AUTH_TOKENS.TOKEN_PORT,
        UserDomainService,
      ],
    },

    {
      provide: LogoutHandler,
      useFactory: (sessionRepo, auditRepo) =>
        new LogoutHandler(sessionRepo, auditRepo),
      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: ListSessionsHandler,
      useFactory: (sessionRepo) =>
        new ListSessionsHandler(sessionRepo),
      inject: [AUTH_TOKENS.SESSION_REPOSITORY],
    },

    {
      provide: RevokeSessionHandler,
      useFactory: (sessionRepo, auditRepo) =>
        new RevokeSessionHandler(sessionRepo, auditRepo),
      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: LogoutAllHandler,
      useFactory: (sessionRepo, auditRepo) =>
        new LogoutAllHandler(sessionRepo, auditRepo),
      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    // 🔥 NEW RESET PASSWORD HANDLERS
    {
      provide: RequestPasswordResetHandler,
      useFactory: (userRepo, resetRepo, auditRepo) =>
        new RequestPasswordResetHandler(userRepo, resetRepo, auditRepo),
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: ResetPasswordHandler,
      useFactory: (userRepo, resetRepo, sessionRepo, auditRepo) =>
        new ResetPasswordHandler(
          userRepo,
          resetRepo,
          sessionRepo,
          auditRepo,
        ),
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,
        AUTH_TOKENS.SESSION_REPOSITORY,
        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },
  ],

  exports: [JwtModule, PassportModule],
})
export class AuthModule {}