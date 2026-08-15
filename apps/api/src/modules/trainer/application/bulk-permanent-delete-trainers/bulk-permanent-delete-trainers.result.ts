import {
  BulkTrainerOperationSummary,
  BulkTrainerItemResult,
} from '../shared/bulk-trainer-operation.result';

export class BulkPermanentDeleteTrainersResult extends BulkTrainerOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkTrainerItemResult[],
  ): BulkPermanentDeleteTrainersResult {
    const summary = BulkTrainerOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkPermanentDeleteTrainersResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
