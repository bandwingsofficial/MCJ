import {
  BulkTrainerOperationSummary,
  BulkTrainerItemResult,
} from '../shared/bulk-trainer-operation.result';

export class BulkRestoreTrainersResult extends BulkTrainerOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkTrainerItemResult[],
  ): BulkRestoreTrainersResult {
    const summary = BulkTrainerOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkRestoreTrainersResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
