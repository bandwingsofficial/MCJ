// auth.module.ts

import { Module } from '@nestjs/common';

import { JwtModule, JwtService } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { PassportModule } from '@nestjs/passport';

// =====================
// CONTROLLER
// =====================

import { AuthController } from './presentation/controllers/auth.controller';
import { AdminAuthController } from './presentation/controllers/admin-auth.controller';

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
import { RequestPasswordResetHandler } from './application/password-reset/request-password-reset.handler';
import { ResetPasswordHandler } from './application/password-reset/reset-password.handler';
import { GetMeHandler } from './application/me/get-me.handler';

// ==============================
// ADMIN
// ==============================

import { LoginAdminHandler } from './application/admin/login/login-admin.handler';
import { VerifyAdminTotpHandler } from './application/admin/verify-admin-totp/verify-admin-totp.handler';

// =====================
// REPOSITORIES
// =====================

import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository';
import { PrismaAuditLogRepository } from './infrastructure/repositories/prisma-audit-log.repository';
import { PrismaPasswordResetRepository } from './infrastructure/repositories/prisma-password-reset.repository';

// =====================
// DOMAIN REPOSITORY TYPES
// =====================

import { UserRepository } from './domain/repositories/user.repository';
import { SessionRepository } from './domain/repositories/session.repository';
import { AuditLogRepository } from './domain/repositories/audit-log.repository';
import { PasswordResetRepository } from './domain/repositories/password-reset.repository';

// =====================
// PORTS
// =====================

import { TokenPort } from './application/ports/token.port';
import { TotpPort } from './application/ports/totp.port';
import { PasswordHasherPort } from './application/ports/password-hasher.port';

// =====================
// SERVICES
// =====================

import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { BcryptPasswordHasherService } from './infrastructure/services/bcrypt-password-hasher.service';
import { OtplibTotpService } from './infrastructure/services/otplib-totp.service';
import { UserDomainService } from './domain/services/user-domain.service';

// =====================
// INFRA
// =====================

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

// =====================
// TOKENS
// =====================

import { AUTH_TOKENS } from './auth.tokens';

// =====================
// AUTH
// =====================

import { JwtStrategy } from './presentation/strategies/jwt.strategy';

import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,

    ConfigModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_ACCESS_SECRET');

        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET is missing');
        }

        return {
          secret,

          signOptions: {
            expiresIn: '15m',
          },
        };
      },
    }),
  ],

  controllers: [AuthController, AdminAuthController],

  providers: [
    // =====================
    // STRATEGY
    // =====================

    JwtStrategy,
    JwtAuthGuard,

    // =====================
    // PASSWORD HASHER
    // =====================

    {
      provide: AUTH_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasherService,
    },
    //========================
    //TOTP SERVICE
    //======================

    {
      provide: AUTH_TOKENS.TOTP_PORT,
      useClass: OtplibTotpService,
    },

    // =====================
    // REPOSITORIES
    // =====================

    {
      provide: AUTH_TOKENS.USER_REPOSITORY,

      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),

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

    {
      provide: AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,

      useFactory: (prisma: PrismaService) =>
        new PrismaPasswordResetRepository(prisma),

      inject: [PrismaService],
    },

    // =====================
    // TOKEN SERVICE
    // =====================

    {
      provide: AUTH_TOKENS.TOKEN_PORT,

      useFactory: (jwtService: JwtService, config: ConfigService) =>
        new JwtTokenService(jwtService, config),

      inject: [JwtService, ConfigService],
    },

    // =====================
    // DOMAIN SERVICES
    // =====================

    UserDomainService,

    // =====================
    // HANDLERS
    // =====================

    {
      provide: RegisterUserHandler,

      useFactory: (
        userRepo: UserRepository,
        auditRepo: AuditLogRepository,
        passwordHasher: PasswordHasherPort,
      ) => new RegisterUserHandler(userRepo, auditRepo, passwordHasher),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        AUTH_TOKENS.PASSWORD_HASHER,
      ],
    },

    {
      provide: LoginUserHandler,

      useFactory: (
        userRepo: UserRepository,
        sessionRepo: SessionRepository,
        auditRepo: AuditLogRepository,
        tokenPort: TokenPort,
        domainService: UserDomainService,
        passwordHasher: PasswordHasherPort,
      ) =>
        new LoginUserHandler(
          userRepo,
          sessionRepo,
          auditRepo,
          tokenPort,
          domainService,
          passwordHasher,
        ),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        AUTH_TOKENS.TOKEN_PORT,

        UserDomainService,

        AUTH_TOKENS.PASSWORD_HASHER,
      ],
    },

    {
      provide: LoginAdminHandler,

      useFactory: (
        userRepo: UserRepository,
        auditRepo: AuditLogRepository,
        domainService: UserDomainService,
        tokenPort: TokenPort,
        passwordHasher: PasswordHasherPort,
      ) =>
        new LoginAdminHandler(
          userRepo,
          auditRepo,
          domainService,
          tokenPort,
          passwordHasher,
        ),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        UserDomainService,
        AUTH_TOKENS.TOKEN_PORT,

        AUTH_TOKENS.PASSWORD_HASHER,
      ],
    },
    {
      provide: VerifyAdminTotpHandler,

      useFactory: (
        userRepo: UserRepository,
        sessionRepo: SessionRepository,
        auditRepo: AuditLogRepository,
        tokenPort: TokenPort,
        totpPort: TotpPort,
      ) =>
        new VerifyAdminTotpHandler(
          userRepo,
          sessionRepo,
          auditRepo,
          tokenPort,
          totpPort,
        ),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        AUTH_TOKENS.TOKEN_PORT,

        AUTH_TOKENS.TOTP_PORT,
      ],
    },

    {
      provide: RefreshTokenHandler,

      useFactory: (
        sessionRepo: SessionRepository,
        userRepo: UserRepository,
        auditRepo: AuditLogRepository,
        tokenPort: TokenPort,
      ) => new RefreshTokenHandler(sessionRepo, userRepo, auditRepo, tokenPort),

      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        AUTH_TOKENS.TOKEN_PORT,
      ],
    },

    {
      provide: LogoutHandler,

      useFactory: (
        sessionRepo: SessionRepository,
        auditRepo: AuditLogRepository,
      ) => new LogoutHandler(sessionRepo, auditRepo),

      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: ListSessionsHandler,

      useFactory: (sessionRepo: SessionRepository) =>
        new ListSessionsHandler(sessionRepo),

      inject: [AUTH_TOKENS.SESSION_REPOSITORY],
    },

    {
      provide: RevokeSessionHandler,

      useFactory: (
        sessionRepo: SessionRepository,
        auditRepo: AuditLogRepository,
      ) => new RevokeSessionHandler(sessionRepo, auditRepo),

      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: LogoutAllHandler,

      useFactory: (
        sessionRepo: SessionRepository,
        auditRepo: AuditLogRepository,
      ) => new LogoutAllHandler(sessionRepo, auditRepo),

      inject: [
        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
      ],
    },

    {
      provide: RequestPasswordResetHandler,

      useFactory: (
        userRepo: UserRepository,
        resetRepo: PasswordResetRepository,
        auditRepo: AuditLogRepository,
        passwordHasher: PasswordHasherPort,
      ) =>
        new RequestPasswordResetHandler(
          userRepo,
          resetRepo,
          auditRepo,
          passwordHasher,
        ),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        AUTH_TOKENS.PASSWORD_HASHER,
      ],
    },

    {
      provide: ResetPasswordHandler,

      useFactory: (
        userRepo: UserRepository,
        resetRepo: PasswordResetRepository,
        sessionRepo: SessionRepository,
        auditRepo: AuditLogRepository,
        passwordHasher: PasswordHasherPort,
      ) =>
        new ResetPasswordHandler(
          userRepo,
          resetRepo,
          sessionRepo,
          auditRepo,
          passwordHasher,
        ),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,

        AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,

        AUTH_TOKENS.SESSION_REPOSITORY,

        AUTH_TOKENS.AUDIT_LOG_REPOSITORY,

        AUTH_TOKENS.PASSWORD_HASHER,
      ],
    },
    {
      provide: GetMeHandler,

      useFactory: (
        userRepo: UserRepository,
      ) =>
        new GetMeHandler(
          userRepo,
        ),

      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
      ],
    },
  ],

  exports: [
    JwtModule,
    PassportModule,
    AUTH_TOKENS.TOKEN_PORT,
    AUTH_TOKENS.PASSWORD_HASHER,
  ],
})
export class AuthModule {}
