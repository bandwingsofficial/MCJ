import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';

export type BulkBatchTemplateResult = {
  requested: number;
  succeeded: number;
  failed: number;
};

export class BulkSetBatchTemplateActiveHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params: {
    ids: string[];
    isActive: boolean;
  }): Promise<BulkBatchTemplateResult> {
    const ids = [...new Set(params.ids.filter(Boolean))];
    const succeeded = await this.templateRepo.setActiveMany(
      ids,
      params.isActive,
    );

    return {
      requested: ids.length,
      succeeded,
      failed: Math.max(0, ids.length - succeeded),
    };
  }
}

export class BulkArchiveBatchTemplatesHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params: {
    ids: string[];
    deletedBy?: string;
  }): Promise<BulkBatchTemplateResult> {
    const ids = [...new Set(params.ids.filter(Boolean))];
    const succeeded = await this.templateRepo.softDeleteMany(
      ids,
      params.deletedBy,
    );
    return {
      requested: ids.length,
      succeeded,
      failed: Math.max(0, ids.length - succeeded),
    };
  }
}

export class BulkRestoreBatchTemplatesHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params: {
    ids: string[];
    updatedBy?: string;
  }): Promise<BulkBatchTemplateResult> {
    const ids = [...new Set(params.ids.filter(Boolean))];
    const succeeded = await this.templateRepo.restoreMany(
      ids,
      params.updatedBy,
    );
    return {
      requested: ids.length,
      succeeded,
      failed: Math.max(0, ids.length - succeeded),
    };
  }
}

export class BulkPermanentDeleteBatchTemplatesHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(ids: string[]): Promise<BulkBatchTemplateResult> {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const succeeded =
      await this.templateRepo.permanentDeleteMany(uniqueIds);
    return {
      requested: uniqueIds.length,
      succeeded,
      failed: Math.max(0, uniqueIds.length - succeeded),
    };
  }
}
