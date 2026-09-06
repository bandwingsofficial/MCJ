import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { BatchTemplateResult } from './batch-template.result';

export class SoftDeleteBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params: {
    id: string;
    deletedBy?: string;
  }): Promise<BatchTemplateResult> {
    const existing = await this.templateRepo.findById(params.id);
    if (!existing || existing.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch timing not found',
        404,
      );
    }

    const updated = await this.templateRepo.softDelete(
      params.id,
      params.deletedBy,
    );
    return BatchTemplateResult.fromRecord(updated);
  }
}

export class RestoreBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params: {
    id: string;
    updatedBy?: string;
  }): Promise<BatchTemplateResult> {
    const existing = await this.templateRepo.findById(params.id);
    if (!existing || !existing.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Archived batch timing not found',
        404,
      );
    }

    const updated = await this.templateRepo.restore(
      params.id,
      params.updatedBy,
    );
    return BatchTemplateResult.fromRecord(updated);
  }
}

export class PermanentDeleteBatchTemplateHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.templateRepo.findById(id);
    if (!existing) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch timing not found',
        404,
      );
    }
    if (!existing.isDeleted) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only archived batch timings can be permanently deleted',
        400,
      );
    }

    await this.templateRepo.permanentDelete(id);
  }
}
