import type { PlacementRepository } from '../../domain/repositories/placement.repository';
import { PlacementDomainService } from '../../domain/services/placement-domain.service';
import { GetPlacementResult } from '../get-placement/get-placement.result';
import { UpdatePlacementCommand } from './update-placement.command';

export class UpdatePlacementHandler {
  constructor(
    private readonly placementRepo: PlacementRepository,
    private readonly domainService: PlacementDomainService,
  ) {}

  async execute(
    command: UpdatePlacementCommand,
  ): Promise<GetPlacementResult> {
    const placement = this.domainService.ensureExists(
      await this.placementRepo.findById(command.id),
    );

    placement.update({
      designation: command.designation,
      salary: command.salary,
      joiningDate: command.joiningDate,
      remarks: command.remarks,
      status: command.status,
      updatedBy: command.updatedBy,
    });

    await this.placementRepo.save(placement);

    return this.domainService.ensureDetailExists(
      await this.placementRepo.findDetailById(placement.id),
    );
  }
}
