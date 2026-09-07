import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { syncAllBatchTimingEnrolledCounts } from '@modules/enrollment/infrastructure/utils/enrollment-timing-count.util';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { ListBatchesQuery } from './list-batches.query';
import { ListBatchesResult } from './list-batches.result';

export class ListBatchesHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    query: ListBatchesQuery,
  ): Promise<ListBatchesResult> {
    const filters = {
      courseId: query.courseId,
      categoryId: query.categoryId,
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

    if (batches.length > 0) {
      await Promise.all(
        batches.map((batch) =>
          syncAllBatchTimingEnrolledCounts(this.prisma, batch.id),
        ),
      );
    }

    const refreshed =
      batches.length > 0
        ? await this.batchRepo.findAll(filters)
        : batches;

    return new ListBatchesResult(
      refreshed.map(GetBatchResult.fromEntity),
      count,
    );
  }
}
