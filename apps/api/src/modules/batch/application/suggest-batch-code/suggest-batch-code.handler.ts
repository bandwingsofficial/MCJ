import type { BatchRepository } from '../../domain/repositories/batch.repository';
import {
  buildBatchCodePrefix,
  formatBatchCode,
  getMonthAbbreviation,
  getTimeCodeFromTimes,
} from '../../domain/utils/batch-code.util';

import { SuggestBatchCodeQuery } from './suggest-batch-code.query';
import { SuggestBatchCodeResult } from './suggest-batch-code.result';

export class SuggestBatchCodeHandler {
  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    query: SuggestBatchCodeQuery,
  ): Promise<SuggestBatchCodeResult> {
    const month = getMonthAbbreviation(new Date());
    const timeCode = getTimeCodeFromTimes(
      query.startTime,
      query.endTime,
    );
    const prefix = buildBatchCodePrefix(month, timeCode);
    const maxSequence =
      await this.batchRepo.getMaxBatchCodeSequence(prefix);
    const batchCode = formatBatchCode(
      month,
      timeCode,
      maxSequence + 1,
    );

    return new SuggestBatchCodeResult(batchCode);
  }
}
