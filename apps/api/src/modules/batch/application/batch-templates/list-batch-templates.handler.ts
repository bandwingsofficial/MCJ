import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { BatchTemplateResult } from './batch-template.result';

export class ListBatchTemplatesHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(params?: {
    isActive?: boolean;
  }): Promise<BatchTemplateResult[]> {
    const rows = await this.templateRepo.list(params);
    return rows.map(BatchTemplateResult.fromRecord);
  }
}
