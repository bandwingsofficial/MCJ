// src/modules/branch/application/create-branch/create-branch.handler.ts

import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { CreateBranchCommand } from './create-branch.command';
import { CreateBranchResult } from './create-branch.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { Branch } from '../../domain/entities/branch.entity';
import { BranchCode } from '../../domain/value-objects/branch-code.vo';
import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';
import { Prisma } from '@prisma/client';

export class CreateBranchHandler {
  private readonly logger = new Logger(
    CreateBranchHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: CreateBranchCommand,
  ): Promise<CreateBranchResult> {
    try {
      this.logger.log(
        '🏢 Create branch request received',
      );

      // =====================
      // 1️⃣ VALIDATION
      // =====================

      if (!command.branchName?.trim()) {
        throw new ValidationError(
          'Branch name is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      if (!command.branchCode?.trim()) {
        throw new ValidationError(
          'Branch code is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      // =====================
      // 2️⃣ CHECK EXISTING
      // =====================

      const normalizedCode = BranchCode.create(
        command.branchCode,
      ).getValue();

      const codeTaken =
        await this.branchRepo.existsByBranchCode(
          normalizedCode,
        );

      this.domainService.ensureBranchCodeIsAvailable(
        codeTaken,
      );

      const existingByName =
        await this.branchRepo.findByBranchNameInsensitive(
          command.branchName,
        );

      this.domainService.ensureBranchNameIsAvailable(
        existingByName,
      );

      const status = command.status;

      const displayOrder =
        !status || status === BranchStatus.ACTIVE
          ? (await this.branchRepo.getMaxDisplayOrder()) + 1
          : null;

      // =====================
      // 3️⃣ CREATE ENTITY
      // =====================

      const branch = Branch.create({
        id: randomUUID(),

        branchName: command.branchName,

        branchCode: normalizedCode,

        email: command.email,
        phone: command.phone,

        addressLine1:
          command.addressLine1,

        addressLine2:
          command.addressLine2,

        city: command.city,
        state: command.state,
        country: command.country,

        postalCode:
          command.postalCode,

        latitude:
          command.latitude,

        longitude:
          command.longitude,

        status,

        description:
          command.description,

        displayOrder,
      });

      // =====================
      // 4️⃣ SAVE
      // =====================

      await this.branchRepo.save(branch);

      this.logger.log(
        `✅ Branch created: ${branch.id}`,
      );

      // =====================
      // 5️⃣ RESPONSE
      // =====================

      return new CreateBranchResult(
        branch.id,

        branch.branchName.getValue(),

        branch.branchCode.getValue(),

        branch.email?.getValue() ?? null,

        branch.phone?.getValue() ?? null,

        branch.addressLine1,

        branch.addressLine2,

        branch.city,

        branch.state,

        branch.country,

        branch.postalCode,

        branch.latitude,

        branch.longitude,

        branch.status,

        branch.description,

        branch.createdAt,

        branch.updatedAt,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(',')
          : String(error.meta?.target ?? '');

        if (target.toLowerCase().includes('branchcode')) {
          throw new ValidationError(
            'Branch code already exists.',
            ERROR_CODES.BRANCH_ALREADY_EXISTS,
            undefined,
            409,
          );
        }

        throw new ValidationError(
          'Branch already exists.',
          ERROR_CODES.BRANCH_ALREADY_EXISTS,
          undefined,
          409,
        );
      }

      // =====================
      // DOMAIN ERRORS
      // =====================

      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}