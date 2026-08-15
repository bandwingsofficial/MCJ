import {
  BulkTrainerOperationSummary,
  BulkTrainerItemResult,
} from '../shared/bulk-trainer-operation.result';

export class BulkDeleteTrainersResult extends BulkTrainerOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkTrainerItemResult[],
  ): BulkDeleteTrainersResult {
    const summary = BulkTrainerOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkDeleteTrainersResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
