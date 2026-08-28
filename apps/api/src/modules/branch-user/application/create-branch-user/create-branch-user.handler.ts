import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import { AUTH_TOKENS } from '../../../auth/auth.tokens';
import { BranchUser } from '../../domain/entities/branch-user.entity';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { resolveCreateIdentity } from '../../domain/services/branch-user-create-identity';
import { BranchUserEmail } from '../../domain/value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../../domain/value-objects/branch-user-phone.vo';
import type { PasswordHasherPort } from '../../../auth/application/ports/password-hasher.port';
import { CreateBranchUserCommand } from './create-branch-user.command';
import { CreateBranchUserResult } from './create-branch-user.result';
import { getDefaultPermissionsForRole } from '../../domain/role-permissions';

export class CreateBranchUserHandler {
  private readonly logger = new Logger(CreateBranchUserHandler.name);

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: CreateBranchUserCommand,
  ): Promise<CreateBranchUserResult> {
    this.logger.log('Create branch user request received');

    this.domainService.ensureBranchExists(
      await this.branchUserRepo.branchExists(command.branchId),
    );

    const passwordHash = await this.passwordHasher.hash(command.password);
    const permissions = command.permissions?.length
      ? command.permissions
      : getDefaultPermissionsForRole(command.role);

    return this.branchUserRepo.runInTransaction(async (repo) => {
      const email = BranchUserEmail.create(command.email);
      const phone = command.phone
        ? BranchUserPhone.create(command.phone)
        : null;

      const emailMatch = await repo.findByEmailIncludingDeleted(email);
      const phoneMatch = phone
        ? await repo.findByPhoneIncludingDeleted(phone)
        : null;

      const decision = resolveCreateIdentity({
        emailMatch,
        phoneMatch,
      });

      if (decision.action === 'restore') {
        this.assertRestoreAllowed(command, decision.user);

        if (!command.confirmRestore) {
          throw new BaseException(
            ERROR_CODES.DELETED_ACCOUNT_RESTORABLE,
            'An inactive account already exists with this email. Creating this user will restore and update that account.',
            409,
            { field: 'email', restorableUserId: decision.user.id },
          );
        }

        decision.user.updateProfile({
          firstName: command.firstName,
          lastName: command.lastName,
          email: command.email,
          phone: command.phone,
          branchId: command.restorePolicy?.requireSameBranchId
            ? undefined
            : command.branchId,
          updatedBy: command.createdBy,
        });
        decision.user.changeRole(command.role, command.createdBy);
        decision.user.assignPermissions(permissions, command.createdBy);
        decision.user.changePassword(passwordHash, command.createdBy);
        decision.user.revokeRefreshToken();
        decision.user.restore(command.createdBy);

        await repo.save(decision.user);

        this.logger.log(`Branch user restored on create: ${decision.user.id}`);

        return this.toResult(decision.user, true);
      }

      const branchUser = BranchUser.create({
        id: randomUUID(),
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
        phone: command.phone,
        password: passwordHash,
        role: command.role,
        permissions,
        branchId: command.branchId,
        createdBy: command.createdBy,
      });

      await repo.save(branchUser);

      this.logger.log(`Branch user created: ${branchUser.id}`);

      return this.toResult(branchUser, false);
    });
  }

  private assertRestoreAllowed(
    command: CreateBranchUserCommand,
    existing: BranchUser,
  ) {
    const policy = command.restorePolicy;

    if (
      policy?.requireSameBranchId &&
      existing.branchId !== policy.requireSameBranchId
    ) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    if (
      policy?.allowedExistingRoles &&
      !policy.allowedExistingRoles.includes(existing.role)
    ) {
      throw new BaseException(
        ERROR_CODES.ROLE_ASSIGNMENT_DENIED,
        'You are not authorized to restore this user.',
        403,
      );
    }
  }

  private toResult(branchUser: BranchUser, restored: boolean) {
    return new CreateBranchUserResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.lastName?.getValue() ?? null,
      branchUser.email.getValue(),
      branchUser.phone?.getValue() ?? null,
      branchUser.role,
      branchUser.permissions,
      branchUser.branchId,
      branchUser.isActive,
      branchUser.createdBy,
      branchUser.createdAt,
      restored,
    );
  }
}
