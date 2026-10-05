import type { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import type { BatchTemplateRepository } from '../../domain/repositories/batch-template.repository';
import { BatchTemplateResult } from './batch-template.result';

export type ListBatchTemplatesQuery = {
  search?: string;
  mode?: CourseMode;
  isActive?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
};

export type ListBatchTemplatesHandlerResult = {
  items: BatchTemplateResult[];
  total: number;
  catalogTotal: number;
};

export class ListBatchTemplatesHandler {
  constructor(
    private readonly templateRepo: BatchTemplateRepository,
  ) {}

  async execute(
    params?: ListBatchTemplatesQuery,
  ): Promise<ListBatchTemplatesHandlerResult> {
    const result = await this.templateRepo.list(params);
    const templateIds = result.items.map((item) => item.id);
    const lifecycleBlocksByTemplateId =
      await this.templateRepo.findLifecycleBlocksByTemplateIds(templateIds);

    return {
      items: result.items.map((row) =>
        BatchTemplateResult.fromRecord(
          row,
          lifecycleBlocksByTemplateId[row.id] ?? [],
        ),
      ),
      total: result.total,
      catalogTotal: result.catalogTotal,
    };
  }
}
