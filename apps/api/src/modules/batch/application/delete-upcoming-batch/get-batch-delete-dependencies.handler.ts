import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { isBatchEligibleForUpcomingDelete } from '../../domain/utils/batch-selection.util';

export class GetBatchDeleteDependenciesResult {
  constructor(
    public readonly batchId: string,
    public readonly canDelete: boolean,
    public readonly branchAssignments: {
      branchId: string;
      branchName: string;
    }[],
  ) {}
}

export class GetBatchDeleteDependenciesHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(batchId: string): Promise<GetBatchDeleteDependenciesResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(batchId),
    );

    const branchAssignments =
      await this.batchRepo.findBranchAssignmentsByBatchId(batch.id);

    const canDelete =
      isBatchEligibleForUpcomingDelete(batch) &&
      branchAssignments.length === 0;

    return new GetBatchDeleteDependenciesResult(
      batch.id,
      canDelete,
      branchAssignments,
    );
  }
}
