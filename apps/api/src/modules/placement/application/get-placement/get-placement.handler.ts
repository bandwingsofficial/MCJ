import type { PlacementRepository } from '../../domain/repositories/placement.repository';
import { PlacementDomainService } from '../../domain/services/placement-domain.service';
import { GetPlacementResult } from './get-placement.result';
import { GetPlacementQuery } from './get-placement.query';

export class GetPlacementHandler {
  constructor(
    private readonly placementRepo: PlacementRepository,
    private readonly domainService: PlacementDomainService,
  ) {}

  async execute(query: GetPlacementQuery): Promise<GetPlacementResult> {
    return this.domainService.ensureDetailExists(
      await this.placementRepo.findDetailById(query.id),
    );
  }
}
