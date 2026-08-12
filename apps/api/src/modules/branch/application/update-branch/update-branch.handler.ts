import { Inject, Logger } from '@nestjs/common';

import { UpdateBranchCommand } from './update-branch.command';
import { UpdateBranchResult } from './update-branch.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchCode } from '../../domain/value-objects/branch-code.vo';
import { BranchDomainService } from '../../domain/services/branch-domain.service';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class UpdateBranchHandler {
  private readonly logger = new Logger(UpdateBranchHandler.name);

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(command: UpdateBranchCommand): Promise<UpdateBranchResult> {
    try {
      this.logger.log('Update branch request received');

      if (!command.branchId?.trim()) {
        throw new ValidationError(
          'Branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const branch = await this.branchRepo.findById(command.branchId);

      this.domainService.ensureBranchExists(branch);

      if (command.branchName !== undefined) {
        branch.changeBranchName(command.branchName);
      }

      if (command.branchCode !== undefined) {
        const nextCode = BranchCode.create(command.branchCode).getValue();

        if (nextCode !== branch.branchCode.getValue()) {
          const existingBranch =
            await this.branchRepo.findByBranchCode(nextCode);

          this.domainService.ensureBranchDoesNotExist(existingBranch);

          branch.changeBranchCode(nextCode);
        }
      }

      if (command.email !== undefined) {
        branch.changeEmail(command.email);
      }

      if (command.phone !== undefined) {
        branch.changePhone(command.phone);
      }

      branch.updateAddress({
        addressLine1: command.addressLine1,
        addressLine2: command.addressLine2,
        city: command.city,
        state: command.state,
        country: command.country,
        postalCode: command.postalCode,
      });

      if (command.latitude !== undefined || command.longitude !== undefined) {
        branch.updateLocation({
          latitude: command.latitude,
          longitude: command.longitude,
        });
      }

      if (command.status !== undefined) {
        branch.changeStatus(command.status);
      }

      if (command.description !== undefined) {
        branch.changeDescription(command.description);
      }

      await this.branchRepo.save(branch);

      this.logger.log(`Branch updated: ${branch.id}`);

      return new UpdateBranchResult(
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
