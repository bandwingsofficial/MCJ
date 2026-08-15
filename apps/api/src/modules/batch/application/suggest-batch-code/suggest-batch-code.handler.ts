import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { formatBatchCode } from '../../domain/utils/batch-code.util';

import { SuggestBatchCodeQuery } from './suggest-batch-code.query';
import { SuggestBatchCodeResult } from './suggest-batch-code.result';

export class SuggestBatchCodeHandler {
  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    _query: SuggestBatchCodeQuery,
  ): Promise<SuggestBatchCodeResult> {
    const maxNumber = await this.batchRepo.getMaxBatchCodeNumber();
    const batchCode = formatBatchCode(maxNumber + 1);

    return new SuggestBatchCodeResult(batchCode);
  }
}
