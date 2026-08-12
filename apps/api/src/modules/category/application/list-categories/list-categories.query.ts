import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class ListCategoriesQuery {
  constructor(
    public readonly branchId?: string,
    public readonly status?: CategoryStatus,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
