import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { ListTrainersQuery } from './list-trainers.query';
import { ListTrainersResult } from './list-trainers.result';

export class ListTrainersHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    query: ListTrainersQuery,
  ): Promise<ListTrainersResult> {
    const filters = {
      branchId: query.branchId,
      status: query.status,
      trainerType: query.trainerType,
      search: query.search,
      isFeatured: query.isFeatured,
      includeDeleted: query.includeDeleted,
      isDeleted: query.isDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    };

    const [trainers, total] = await Promise.all([
      this.trainerRepo.findAll(filters),
      this.trainerRepo.count(filters),
    ]);

    return new ListTrainersResult(
      trainers.map(GetTrainerResult.fromEntity),
      total,
    );
  }
}
