import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { BatchTemplateResult } from './batch-template.result';

export class GetBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(id: string): Promise<BatchTemplateResult> {
    const row = await this.templateRepo.findById(id);
    if (!row) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch template not found',
        404,
      );
    }
    return BatchTemplateResult.fromRecord(row);
  }
}
