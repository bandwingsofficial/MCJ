import type { BatchRepository } from '../../domain/repositories/batch.repository';
import {
  formatBatchCode,
  getMonthAbbreviation,
} from '../../domain/utils/batch-code.util';

import { SuggestBatchCodeQuery } from './suggest-batch-code.query';
import { SuggestBatchCodeResult } from './suggest-batch-code.result';

export class SuggestBatchCodeHandler {
  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    query: SuggestBatchCodeQuery,
  ): Promise<SuggestBatchCodeResult> {
    const month = getMonthAbbreviation(query.startDate);
    const maxSequence = await this.batchRepo.getMaxBatchCodeSequence();
    const batchCode = formatBatchCode(month, maxSequence + 1);

    return new SuggestBatchCodeResult(batchCode);
  }
}
