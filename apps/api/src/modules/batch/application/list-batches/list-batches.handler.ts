import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { ListBatchesQuery } from './list-batches.query';

export class ListBatchesHandler {
  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    query: ListBatchesQuery,
  ): Promise<GetBatchResult[]> {
    const batches = await this.batchRepo.findAll({
      courseId: query.courseId,
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      isFeatured: query.isFeatured,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    });

    return batches.map(GetBatchResult.fromEntity);
  }
}
