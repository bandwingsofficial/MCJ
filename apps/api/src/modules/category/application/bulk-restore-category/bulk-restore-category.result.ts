import { Category } from '../../domain/entities/category.entity';

export class BulkRestoreCategoryResult {
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
  ): BulkRestoreCategoryResult {
    return new BulkRestoreCategoryResult(
      categories.map((category) => ({
        id: category.id,
        name: category.name.getValue(),
        status: category.status,
        displayOrder: category.displayOrder,
      })),
    );
  }
}