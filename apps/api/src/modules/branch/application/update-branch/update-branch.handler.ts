import { Inject, Logger } from '@nestjs/common';

import { UpdateBranchCommand } from './update-branch.command';
import { UpdateBranchResult } from './update-branch.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchCode } from '../../domain/value-objects/branch-code.vo';
import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { UploadDomainService } from '@/modules/uploads/domain/services/upload-domain.service';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';
import { Prisma } from '@prisma/client';

const BRANCH_UPLOAD_FOLDER = 'branches';
const BRANCH_THUMBNAIL_FILE_NAME = 'thumbnail';

export class UpdateBranchHandler {
  private readonly logger = new Logger(UpdateBranchHandler.name);

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,

    private readonly uploadDomainService: UploadDomainService,
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
        const nextName = command.branchName.trim();
        const currentName = branch.branchName.getValue();

        if (
          nextName.toLowerCase() !== currentName.toLowerCase()
        ) {
          const existingByName =
            await this.branchRepo.findByBranchNameInsensitive(
              nextName,
              branch.id,
            );

          this.domainService.ensureBranchNameIsAvailable(
            existingByName,
          );
        }

        branch.changeBranchName(command.branchName);
      }

      if (command.branchCode !== undefined) {
        const nextCode = BranchCode.create(command.branchCode).getValue();

        if (nextCode !== branch.branchCode.getValue()) {
          const codeTaken =
            await this.branchRepo.existsByBranchCode(
              nextCode,
              branch.id,
            );

          this.domainService.ensureBranchCodeIsAvailable(
            codeTaken,
          );

          branch.changeBranchCode(nextCode);
        }
      }

      if (command.email !== undefined) {
        branch.changeEmail(command.email);
      }

      if (command.phone !== undefined) {
        branch.changePhone(command.phone);
      }

      if (
        command.addressLine1 !== undefined ||
        command.addressLine2 !== undefined ||
        command.city !== undefined ||
        command.state !== undefined ||
        command.country !== undefined ||
        command.postalCode !== undefined
      ) {
        branch.updateAddress({
          addressLine1: command.addressLine1,
          addressLine2: command.addressLine2,
          city: command.city,
          state: command.state,
          country: command.country,
          postalCode: command.postalCode,
        });
      }

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

      if (
        command.thumbnailFileId !== undefined &&
        command.thumbnailFileId !== branch.thumbnailFileId
      ) {
        if (command.thumbnailFileId) {
          const upload =
            await this.uploadDomainService.replaceLinkedUpload({
              previousUploadId: branch.thumbnailFileId,
              nextUploadId: command.thumbnailFileId,
              folder: BRANCH_UPLOAD_FOLDER,
              entityId: branch.id,
              fileName: BRANCH_THUMBNAIL_FILE_NAME,
            });

          branch.updateThumbnail({
            thumbnailFileId: upload.id,
            thumbnailUrl: upload.url,
          });
        } else {
          if (branch.thumbnailFileId) {
            await this.uploadDomainService.softDelete(branch.thumbnailFileId);
          }

          branch.updateThumbnail({
            thumbnailFileId: null,
            thumbnailUrl: null,
          });
        }
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
        branch.thumbnailUrl,
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
