import { TrainerStatus } from '../../domain/enums/trainer-status.enum';

import {
  BulkTrainerOperationSummary,
  BulkTrainerItemResult,
} from '../shared/bulk-trainer-operation.result';

export class BulkUpdateTrainerStatusResult extends BulkTrainerOperationSummary {
  constructor(
    requestedCount: number,
    processedCount: number,
    successCount: number,
    failedCount: number,
    results: BulkTrainerItemResult[],
    failures: BulkTrainerItemResult[],
    public readonly status: TrainerStatus,
  ) {
    super(
      requestedCount,
      processedCount,
      successCount,
      failedCount,
      results,
      failures,
    );
  }

  static create(
    status: TrainerStatus,
    requestedCount: number,
    results: BulkTrainerItemResult[],
  ): BulkUpdateTrainerStatusResult {
    const summary = BulkTrainerOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkUpdateTrainerStatusResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
      status,
    );
  }
}
