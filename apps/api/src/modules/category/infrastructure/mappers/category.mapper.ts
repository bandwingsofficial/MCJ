import { Category as PrismaCategory, Prisma } from '@prisma/client';

import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class CategoryMapper {
  static toDomain(record: PrismaCategory): Category {
    return Category.reconstitute({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      thumbnailFileId: record.thumbnailFileId,
      thumbnailUrl: record.thumbnailUrl,
      status: record.status as CategoryStatus,
      displayOrder: record.displayOrder ?? null,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    category: Category,
  ): Prisma.CategoryUncheckedCreateInput {
    return {
      id: category.id,
      name: category.name.getValue(),
      slug: category.slug.getValue(),
      description: category.description,
      thumbnailFileId: category.thumbnailFileId,
      thumbnailUrl: category.thumbnailUrl,
      status: category.status,
      displayOrder: category.displayOrder ?? undefined,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      isDeleted: category.isDeleted,
      deletedAt: category.deletedAt,
      deletedBy: category.deletedBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
