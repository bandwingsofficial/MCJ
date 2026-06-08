// src/features/categories/mappers/category.mapper.ts

import type {
  Category,
  CategoryDto,
} from "@/src/features/categories/types/category.types";

export function mapCategoryDtoToCategory(
  dto: CategoryDto
): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    thumbnailUrl: dto.thumbnailUrl,
    status: dto.status,
    displayOrder: dto.displayOrder,
    branchId: dto.branchId,
  };
}

export function mapCategoryDtosToCategories(
  dtos: CategoryDto[]
): Category[] {
  return dtos.map(
    mapCategoryDtoToCategory
  );
}