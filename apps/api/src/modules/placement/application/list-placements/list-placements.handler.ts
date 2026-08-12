import type { PlacementRepository } from '../../domain/repositories/placement.repository';
import { GetPlacementResult } from '../get-placement/get-placement.result';
import { ListPlacementsQuery } from './list-placements.query';

export class ListPlacementsHandler {
  constructor(private readonly placementRepo: PlacementRepository) {}

  async execute(
    query: ListPlacementsQuery,
  ): Promise<GetPlacementResult[]> {
    return this.placementRepo.findDetails({
      jobId: query.jobId,
      userId: query.userId,
      status: query.status,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }
}
