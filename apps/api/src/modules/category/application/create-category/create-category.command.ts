import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly slug?: string,
    public readonly description?: string,
    public readonly thumbnailFileId?: string,
    public readonly status?: CategoryStatus,
    public readonly displayOrder?: number,
    public readonly branchId?: string,
    public readonly createdBy?: string,
  ) {}
}
