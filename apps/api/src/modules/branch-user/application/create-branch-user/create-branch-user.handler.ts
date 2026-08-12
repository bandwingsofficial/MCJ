import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import { AUTH_TOKENS } from '../../../auth/auth.tokens';
import { BranchUser } from '../../domain/entities/branch-user.entity';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { BranchUserEmail } from '../../domain/value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../../domain/value-objects/branch-user-phone.vo';
import type { PasswordHasherPort } from '../../../auth/application/ports/password-hasher.port';
import { CreateBranchUserCommand } from './create-branch-user.command';
import { CreateBranchUserResult } from './create-branch-user.result';

export class CreateBranchUserHandler {
  private readonly logger = new Logger(
    CreateBranchUserHandler.name,
  );

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
    this.logger.log(
      'Create branch user request received',
    );

    this.domainService.ensureBranchExists(
      await this.branchUserRepo.branchExists(
        command.branchId,
      ),
    );

    const email =
      BranchUserEmail.create(command.email);

    this.domainService.ensureDoesNotExist(
      await this.branchUserRepo.findByEmail(email),
      'email',
    );

    if (command.phone) {
      const phone =
        BranchUserPhone.create(command.phone);

      this.domainService.ensureDoesNotExist(
        await this.branchUserRepo.findByPhone(
          phone,
        ),
        'phone',
      );
    }

    const passwordHash =
      await this.passwordHasher.hash(
        command.password,
      );

    const branchUser = BranchUser.create({
      id: randomUUID(),
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      phone: command.phone,
      password: passwordHash,
      role: command.role,
      permissions: command.permissions,
      branchId: command.branchId,
      createdBy: command.createdBy,
    });

    await this.branchUserRepo.save(branchUser);

    this.logger.log(
      `Branch user created: ${branchUser.id}`,
    );

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
    );
  }
}
