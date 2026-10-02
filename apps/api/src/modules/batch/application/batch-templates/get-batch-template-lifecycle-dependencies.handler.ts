import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import type { BatchTemplateLifecycleBlockRecord } from '../../domain/repositories/batch-template.repository';

export class GetBatchTemplateLifecycleDependenciesResult {
  constructor(
    public readonly templateId: string,
    public readonly lifecycleBlocks: BatchTemplateLifecycleBlockRecord[],
    public readonly canDeactivate: boolean,
    public readonly canArchive: boolean,
  ) {}
}

export class GetBatchTemplateLifecycleDependenciesHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(
    templateId: string,
  ): Promise<GetBatchTemplateLifecycleDependenciesResult> {
    const existing = await this.templateRepo.findById(templateId);

    if (!existing) {
      throw new BaseException(
        ERROR_CODES.BATCH_TEMPLATE_NOT_FOUND,
        'Batch timing not found',
        404,
      );
    }

    const lifecycleBlocks =
      (
        await this.templateRepo.findLifecycleBlocksByTemplateIds([
          templateId,
        ])
      )[templateId] ?? [];

    const blocked = lifecycleBlocks.length > 0;

    return new GetBatchTemplateLifecycleDependenciesResult(
      templateId,
      lifecycleBlocks,
      !blocked,
      !blocked,
    );
  }
}
