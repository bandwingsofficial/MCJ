import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { ListTrainersQuery } from './list-trainers.query';

export class ListTrainersHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    query: ListTrainersQuery,
  ): Promise<GetTrainerResult[]> {
    const trainers = await this.trainerRepo.findAll({
      branchId: query.branchId,
      status: query.status,
      trainerType: query.trainerType,
      search: query.search,
      isFeatured: query.isFeatured,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    });

    return trainers.map(GetTrainerResult.fromEntity);
  }
}
