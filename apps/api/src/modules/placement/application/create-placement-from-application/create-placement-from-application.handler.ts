import { randomUUID } from 'crypto';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { Placement } from '../../domain/entities/placement.entity';
import type { PlacementRepository } from '../../domain/repositories/placement.repository';
import { PlacementDomainService } from '../../domain/services/placement-domain.service';

import { CreatePlacementFromApplicationCommand } from './create-placement-from-application.command';

export class CreatePlacementFromApplicationHandler {
  constructor(
    private readonly placementRepo: PlacementRepository,
    private readonly domainService: PlacementDomainService,
  ) {}

  async execute(
    command: CreatePlacementFromApplicationCommand,
  ): Promise<void> {
    await this.domainService.ensureApplicationHasNoPlacement(
      this.placementRepo,
      command.application.id,
    );

    if (!command.application.studentId) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'This application is not linked to a student and cannot be placed.',
        400,
      );
    }

    const placement = Placement.create({
      id: randomUUID(),
      jobId: command.application.jobId,
      applicationId: command.application.id,
      userId: command.application.studentId,
      companyName: command.job.companyName.getValue(),
      designation: command.job.title.getValue(),
      salary: command.job.salary.getMax(),
      createdBy: command.createdBy,
    });

    await this.placementRepo.save(placement);
  }
}
