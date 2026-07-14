// src/features/categories/components/category-list.tsx

"use client";

import {
  CategoryCard,
} from "@/src/features/categories/components/category-card";

import type {
  Category,
} from "@/src/features/categories/types/category.types";

interface CategoryListProps {
  categories: Category[];
  onCategoryClick?: (
    category: Category
  ) => void;
}

export function CategoryList({
  categories,
  onCategoryClick,
}: CategoryListProps) {
  return (
    <div
      className="
        grid
        gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >
      {categories.map(
        (category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={
              onCategoryClick
            }
          />
        )
      )}
    </div>
  );
}