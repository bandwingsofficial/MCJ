import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class ListCategoriesResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly thumbnailFileId: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly status: CategoryStatus,
    public readonly displayOrder: number | null,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(
    category: Category,
  ): ListCategoriesResult {
    return new ListCategoriesResult(
      category.id,
      category.name.getValue(),
      category.slug.getValue(),
      category.description,
      category.thumbnailFileId,
      category.thumbnailUrl,
      category.status,
      category.displayOrder ?? null,
      category.createdBy,
      category.updatedBy,
      category.isDeleted,
      category.deletedAt,
      category.createdAt,
      category.updatedAt,
    );
  }
}
