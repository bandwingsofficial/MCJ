import { randomUUID } from 'crypto';

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
