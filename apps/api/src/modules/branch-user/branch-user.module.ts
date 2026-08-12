import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { AUTH_TOKENS } from '../auth/auth.tokens';
import type { TokenPort } from '../auth/application/ports/token.port';

import { BRANCH_USER_TOKENS } from './branch-user.tokens';

import type { BranchUserRepository } from './domain/repositories/branch-user.repository';
import { BranchUserDomainService } from './domain/services/branch-user-domain.service';

import { PrismaBranchUserRepository } from './infrastructure/repositories/prisma-branch-user.repository';

import type { PasswordHasherPort } from '../auth/application/ports/password-hasher.port';

import { CreateBranchUserHandler } from './application/create-branch-user/create-branch-user.handler';
import { ListBranchUsersHandler } from './application/list-branch-users/list-branch-users.handler';
import { GetBranchUserHandler } from './application/get-branch-user/get-branch-user.handler';
import { UpdateBranchUserHandler } from './application/update-branch-user/update-branch-user.handler';
import { UpdateBranchUserStatusHandler } from './application/update-branch-user-status/update-branch-user-status.handler';
import { DeleteBranchUserHandler } from './application/delete-branch-user/delete-branch-user.handler';
import { ResetBranchUserPasswordHandler } from './application/reset-branch-user-password/reset-branch-user-password.handler';
import { LoginBranchUserHandler } from './application/login-branch-user/login-branch-user.handler';
import { RefreshBranchUserTokenHandler } from './application/refresh-branch-user-token/refresh-branch-user-token.handler';
import { LogoutBranchUserHandler } from './application/logout-branch-user/logout-branch-user.handler';
import { GetBranchUserMeHandler } from './application/me/get-branch-user-me.handler';
import { RestoreBranchUserHandler } from './application/restore-branch-user/restore-branch-user.handler';

import { AdminBranchUserController } from './presentation/controllers/admin-branch-user.controller';
import { BranchAuthController } from './presentation/controllers/branch-auth.controller';

import { BranchJwtStrategy } from './presentation/strategies/branch-jwt.strategy';
import { BranchJwtAuthGuard } from '@common/guards/branch-jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchAccessGuard } from '@common/guards/branch-access.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { BranchModule } from '../branch/branch.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchModule,
  ],

  controllers: [
    AdminBranchUserController,
    BranchAuthController,
  ],

  providers: [
    BranchUserDomainService,

    BranchJwtStrategy,
    BranchJwtAuthGuard,
    RolesGuard,
    BranchAccessGuard,
    SuperAdminGuard,

    {
      provide:
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaBranchUserRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        passwordHasher: PasswordHasherPort,
        domainService: BranchUserDomainService,
      ) =>
        new CreateBranchUserHandler(
          branchUserRepo,
          passwordHasher,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        AUTH_TOKENS.PASSWORD_HASHER,
        BranchUserDomainService,
      ],
    },

    {
      provide: ListBranchUsersHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        branchRepo: BranchRepository,
      ) =>
        new ListBranchUsersHandler(
          branchUserRepo,
          branchRepo,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
      ],
    },

    {
      provide: GetBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        branchRepo: BranchRepository,
        domainService: BranchUserDomainService,
      ) =>
        new GetBranchUserHandler(
          branchUserRepo,
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchUserDomainService,
      ],
    },

    {
      provide: UpdateBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        domainService: BranchUserDomainService,
      ) =>
        new UpdateBranchUserHandler(
          branchUserRepo,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BranchUserDomainService,
      ],
    },

    {
      provide: UpdateBranchUserStatusHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        domainService: BranchUserDomainService,
      ) =>
        new UpdateBranchUserStatusHandler(
          branchUserRepo,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BranchUserDomainService,
      ],
    },

    {
      provide: DeleteBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        domainService: BranchUserDomainService,
      ) =>
        new DeleteBranchUserHandler(
          branchUserRepo,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BranchUserDomainService,
      ],
    },

    {
      provide: ResetBranchUserPasswordHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        passwordHasher: PasswordHasherPort,
        domainService: BranchUserDomainService,
      ) =>
        new ResetBranchUserPasswordHandler(
          branchUserRepo,
          passwordHasher,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        AUTH_TOKENS.PASSWORD_HASHER,
        BranchUserDomainService,
      ],
    },
    {
      provide: RestoreBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        domainService: BranchUserDomainService,
      ) =>
        new RestoreBranchUserHandler(
          branchUserRepo
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BranchUserDomainService,
      ],
    },
    {
      provide: LoginBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        passwordHasher: PasswordHasherPort,
        tokenPort: TokenPort,
        domainService: BranchUserDomainService,
      ) =>
        new LoginBranchUserHandler(
          branchUserRepo,
          passwordHasher,
          tokenPort,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        AUTH_TOKENS.PASSWORD_HASHER,
        AUTH_TOKENS.TOKEN_PORT,
        BranchUserDomainService,
      ],
    },

    {
      provide: RefreshBranchUserTokenHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        tokenPort: TokenPort,
        domainService: BranchUserDomainService,
      ) =>
        new RefreshBranchUserTokenHandler(
          branchUserRepo,
          tokenPort,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        AUTH_TOKENS.TOKEN_PORT,
        BranchUserDomainService,
      ],
    },

    {
      provide: LogoutBranchUserHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        domainService: BranchUserDomainService,
      ) =>
        new LogoutBranchUserHandler(
          branchUserRepo,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BranchUserDomainService,
      ],
    },

    {
      provide: GetBranchUserMeHandler,
      useFactory: (
        branchUserRepo: BranchUserRepository,
        domainService: BranchUserDomainService,
      ) =>
        new GetBranchUserMeHandler(
          branchUserRepo,
          domainService,
        ),
      inject: [
        BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
        BranchUserDomainService,
      ],
    },
  ],

  exports: [
    BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
    BranchJwtAuthGuard,
    RolesGuard,
    BranchAccessGuard,
  ],
})
export class BranchUserModule {}
