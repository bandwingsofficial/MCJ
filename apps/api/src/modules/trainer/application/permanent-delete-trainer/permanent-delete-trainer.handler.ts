import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';

import { PermanentDeleteTrainerCommand } from './permanent-delete-trainer.command';
import { PermanentDeleteTrainerResult } from './permanent-delete-trainer.result';

function isForeignKeyRestrictError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('foreign key constraint') ||
    message.includes('violates restrict') ||
    message.includes('23001') ||
    message.includes('23503')
  );
}

export class PermanentDeleteTrainerHandler {
  private readonly logger = new Logger(
    PermanentDeleteTrainerHandler.name,
  );

  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: PermanentDeleteTrainerCommand,
  ): Promise<PermanentDeleteTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id, true),
    );
    const profileImageFileId = trainer.profileImageFileId;
    const displayOrder = trainer.displayOrder;

    try {
      await this.trainerRepo.deletePermanent(trainer.id);
    } catch (error) {
      this.logger.error(
        `Permanent delete failed for trainer ${trainer.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (isForeignKeyRestrictError(error)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Cannot permanently delete this trainer because it is still referenced by other records.',
          409,
        );
      }

      throw error;
    }

    if (displayOrder != null) {
      await this.trainerRepo.closeDisplayOrderGap(displayOrder);
    }

    if (profileImageFileId) {
      try {
        await this.uploadDomainService.permanentDelete(
          profileImageFileId,
        );
      } catch (error) {
        this.logger.error(
          `Trainer ${trainer.id} was deleted but profile image ${profileImageFileId} could not be cleaned up`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return new PermanentDeleteTrainerResult(trainer.id, true);
  }
}
