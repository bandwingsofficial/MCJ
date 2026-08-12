import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import { AUTH_TOKENS } from '../../../auth/auth.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import type { PasswordHasherPort } from '../../../auth/application/ports/password-hasher.port';
import { ResetBranchUserPasswordCommand } from './reset-branch-user-password.command';
import { ResetBranchUserPasswordResult } from './reset-branch-user-password.result';

export class ResetBranchUserPasswordHandler {
  private readonly logger = new Logger(
    ResetBranchUserPasswordHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: ResetBranchUserPasswordCommand,
  ): Promise<ResetBranchUserPasswordResult> {
    this.logger.log(
      'Reset branch user password request received',
    );

    const branchUser =
      await this.branchUserRepo.findById(
        command.branchUserId,
      );

    this.domainService.ensureExists(branchUser);

    const passwordHash =
      await this.passwordHasher.hash(
        command.newPassword,
      );

    branchUser.changePassword(
      passwordHash,
      command.updatedBy,
    );
    branchUser.revokeRefreshToken();

    await this.branchUserRepo.save(branchUser);

    return new ResetBranchUserPasswordResult(
      true,
      'Branch user password reset successfully',
    );
  }
}
