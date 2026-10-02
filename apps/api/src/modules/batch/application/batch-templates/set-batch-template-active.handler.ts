import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BatchTemplateLifecycleBlockedException } from '../../domain/errors/batch-template-lifecycle.exception';
import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { formatBatchTemplateLifecycleBlockMessage } from '../../domain/utils/batch-template-lifecycle-block.util';
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
    if (!existing || existing.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch timing not found',
        404,
      );
    }

    if (!params.isActive) {
      const blocks =
        (
          await this.templateRepo.findLifecycleBlocksByTemplateIds([
            params.id,
          ])
        )[params.id] ?? [];

      if (blocks.length > 0) {
        throw new BatchTemplateLifecycleBlockedException(
          formatBatchTemplateLifecycleBlockMessage('deactivate', blocks),
        );
      }
    }

    const updated = await this.templateRepo.update(params.id, {
      isActive: params.isActive,
      updatedBy: params.updatedBy,
    });

    return BatchTemplateResult.fromRecord(updated);
  }
}
