import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { BatchTemplateResult } from './batch-template.result';

export class SetBatchTemplateActiveHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params: {
    id: string;
    isActive: boolean;
    updatedBy?: string;
  }): Promise<BatchTemplateResult> {
    const existing = await this.templateRepo.findById(params.id);
    if (!existing) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch template not found',
        404,
      );
    }

    const updated = await this.templateRepo.update(params.id, {
      isActive: params.isActive,
      updatedBy: params.updatedBy,
    });

    return BatchTemplateResult.fromRecord(updated);
  }
}
