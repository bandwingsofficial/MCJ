import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { ensureBatchCanDeleteUpcoming } from '../../domain/utils/batch-selection.util';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

export class DeleteUpcomingBatchCommand {
  constructor(public readonly id: string) {}
}

export class DeleteUpcomingBatchResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
  ) {}
}

export class DeleteUpcomingBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: DeleteUpcomingBatchCommand,
  ): Promise<DeleteUpcomingBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id),
    );

    const branchAssignments =
      await this.batchRepo.findBranchAssignmentsByBatchId(batch.id);

    ensureBatchCanDeleteUpcoming(
      batch,
      branchAssignments.map((item) => item.branchName),
    );

    await this.batchRepo.deletePermanent(batch.id);

    notifyDomainMutation({
      domain: 'batch',
      action: 'deleted',
      entityId: batch.id,
    });

    return new DeleteUpcomingBatchResult(batch.id, true);
  }
}
