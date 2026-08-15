import { GetBatchResult } from '../get-batch/get-batch.result';

export class ListBatchesResult {
  constructor(
    public readonly items: GetBatchResult[],
    public readonly count: number,
  ) {}
}
