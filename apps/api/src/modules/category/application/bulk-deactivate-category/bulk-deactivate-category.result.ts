import { Category } from '../../domain/entities/category.entity';

export class BulkDeactivateCategoryResult {
  constructor(
    public readonly categories: {
      id: string;
      name: string;
      status: string;
    }[],
  ) {}

  static fromEntities(
    categories: Category[],
  ): BulkDeactivateCategoryResult {
    return new BulkDeactivateCategoryResult(
      categories.map((category) => ({
        id: category.id,
        name: category.name.getValue(),
        status: category.status,
      })),
    );
  }
}