import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';

import { GetTrainerQuery } from './get-trainer.query';
import { GetTrainerResult } from './get-trainer.result';

export class GetTrainerHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    query: GetTrainerQuery,
  ): Promise<GetTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    if (
      query.onlyActive &&
      trainer.status !== TrainerStatus.ACTIVE
    ) {
      throw new BaseException(
        ERROR_CODES.TRAINER_NOT_FOUND,
        'Trainer not found',
        404,
      );
    }

    return GetTrainerResult.fromEntity(trainer);
  }
}
