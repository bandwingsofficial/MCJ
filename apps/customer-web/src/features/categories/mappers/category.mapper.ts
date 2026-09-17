// src/features/categories/mappers/category.mapper.ts

import type {
  Category,
  CategoryDto,
} from "@/src/features/categories/types/category.types";
import { resolvePersistedImageUrl } from "@/src/shared/utils/image-url.util";

export function mapCategoryDtoToCategory(
  dto: CategoryDto
): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    thumbnailUrl: resolvePersistedImageUrl(
      dto.thumbnailUrl,
      dto.updatedAt,
    ),
    updatedAt: dto.updatedAt,
    status: dto.status,
    displayOrder: dto.displayOrder,
    branchId: dto.branchId,
    courseCount: dto.courseCount,
  };
}

export function mapCategoryDtosToCategories(
  dtos: CategoryDto[]
): Category[] {
  return dtos.map(
    mapCategoryDtoToCategory
  );
}