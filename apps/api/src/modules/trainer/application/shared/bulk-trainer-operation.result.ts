import { TrainerStatus } from '../../domain/enums/trainer-status.enum';

export interface BulkTrainerItemResult {
  trainerId: string;
  success: boolean;
  message: string;
  status?: TrainerStatus;
}

export class BulkTrainerOperationSummary {
  constructor(
    public readonly requestedCount: number,
    public readonly processedCount: number,
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly results: BulkTrainerItemResult[],
    public readonly failures: BulkTrainerItemResult[],
  ) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkTrainerItemResult[],
  ): BulkTrainerOperationSummary {
    const failures = results.filter((item) => !item.success);

    return new BulkTrainerOperationSummary(
      requestedCount,
      results.length,
      results.length - failures.length,
      failures.length,
      results,
      failures,
    );
  }
}
