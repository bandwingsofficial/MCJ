// src/modules/branch/application/create-branch/create-branch.handler.ts

import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { CreateBranchCommand } from './create-branch.command';
import { CreateBranchResult } from './create-branch.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { Branch } from '../../domain/entities/branch.entity';

import { BranchDomainService } from '../../domain/services/branch-domain.service';

import { BaseException } from '@common/exceptions/base.exception';

import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

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

      const existingBranch =
        await this.branchRepo.findByBranchCode(
          command.branchCode,
        );

        console.log(existingBranch);

      this.domainService.ensureBranchDoesNotExist(
        existingBranch,
      );

      // =====================
      // 3️⃣ CREATE ENTITY
      // =====================

      const branch = Branch.create({
        id: randomUUID(),

        branchName: command.branchName,

        branchCode: command.branchCode,

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

        status: command.status,

        description:
          command.description,
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