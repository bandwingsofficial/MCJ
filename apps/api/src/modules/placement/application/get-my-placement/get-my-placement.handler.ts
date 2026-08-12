import type { PlacementRepository } from '../../domain/repositories/placement.repository';
import { GetPlacementResult } from '../get-placement/get-placement.result';
import { GetMyPlacementQuery } from './get-my-placement.query';

export class GetMyPlacementHandler {
  constructor(
    private readonly placementRepo: PlacementRepository,
  ) {}

  async execute(
    query: GetMyPlacementQuery,
  ): Promise<GetPlacementResult | null> {
    return this.placementRepo.findDetailByUserId(query.userId);
  }
}
