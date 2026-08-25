import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { ListBatchesQuery } from './list-batches.query';
import { ListBatchesResult } from './list-batches.result';

export class ListBatchesHandler {
  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    query: ListBatchesQuery,
  ): Promise<ListBatchesResult> {
    const filters = {
      courseId: query.courseId,
      branchId: query.branchId,
      trainerId: query.trainerId,
      mode: query.mode,
      status: query.status,
      search: query.search,
      isFeatured: query.isFeatured,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      isDeleted: query.isDeleted,
      isActive: query.isActive,
      skip: query.skip,
      take: query.take,
    };

    const [batches, count] = await Promise.all([
      this.batchRepo.findAll(filters),
      this.batchRepo.count(filters),
    ]);

    return new ListBatchesResult(
      batches.map(GetBatchResult.fromEntity),
      count,
    );
  }
}
