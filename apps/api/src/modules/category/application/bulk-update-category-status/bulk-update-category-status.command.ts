import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class BulkUpdateCategoryStatusCommand {
  constructor(
    public readonly categoryIds: string[],
    public readonly status: CategoryStatus,
    public readonly updatedBy?: string,
  ) {}
}
