import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { BranchUserEmail } from '../../domain/value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../../domain/value-objects/branch-user-phone.vo';
import { UpdateBranchUserCommand } from './update-branch-user.command';
import { UpdateBranchUserResult } from './update-branch-user.result';

export class UpdateBranchUserHandler {
  private readonly logger = new Logger(
    UpdateBranchUserHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: UpdateBranchUserCommand,
  ): Promise<UpdateBranchUserResult> {
    this.logger.log(
      'Update branch user request received',
    );

    const branchUser =
      await this.branchUserRepo.findById(
        command.branchUserId,
      );

    this.domainService.ensureExists(branchUser);

    if (command.branchId) {
      this.domainService.ensureBranchExists(
        await this.branchUserRepo.branchExists(
          command.branchId,
        ),
      );
    }

    if (command.email) {
      const nextEmail =
        BranchUserEmail.create(command.email);

      if (
        nextEmail.getValue() !==
        branchUser.email.getValue()
      ) {
        this.domainService.ensureDoesNotExist(
          await this.branchUserRepo.findByEmailIncludingDeleted(
            nextEmail,
          ),
          'email',
        );
      }
    }

    if (command.phone) {
      const nextPhone =
        BranchUserPhone.create(command.phone);

      if (
        nextPhone.getValue() !==
        branchUser.phone?.getValue()
      ) {
        this.domainService.ensureDoesNotExist(
          await this.branchUserRepo.findByPhoneIncludingDeleted(
            nextPhone,
          ),
          'phone',
        );
      }
    }

    branchUser.updateProfile({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      phone: command.phone,
      branchId: command.branchId,
      updatedBy: command.updatedBy,
    });

    if (command.role !== undefined) {
      branchUser.changeRole(
        command.role,
        command.updatedBy,
      );
    }

    if (command.permissions !== undefined) {
      branchUser.assignPermissions(
        command.permissions,
        command.updatedBy,
      );
    }

    await this.branchUserRepo.save(branchUser);

    this.logger.log(
      `Branch user updated: ${branchUser.id}`,
    );

    return new UpdateBranchUserResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.lastName?.getValue() ?? null,
      branchUser.email.getValue(),
      branchUser.phone?.getValue() ?? null,
      branchUser.role,
      branchUser.permissions,
      branchUser.branchId,
      branchUser.isActive,
      branchUser.updatedBy,
      branchUser.updatedAt,
    );
  }
}
