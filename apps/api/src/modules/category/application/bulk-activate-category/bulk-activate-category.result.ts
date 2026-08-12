import { Category } from '../../domain/entities/category.entity';

export class BulkActivateCategoryResult {
  constructor(
    public readonly categories: {
      id: string;
      name: string;
      status: string;
      displayOrder: number | null;
    }[],
  ) {}

  static fromEntities(
    categories: Category[],
  ): BulkActivateCategoryResult {
    return new BulkActivateCategoryResult(
      categories.map((category) => ({
        id: category.id,
        name: category.name.getValue(),
        status: category.status,
        displayOrder: category.displayOrder,
      })),
    );
  }
}