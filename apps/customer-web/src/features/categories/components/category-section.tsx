// src/features/categories/components/category-section.tsx

"use client";

import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { useCategorySearch } from "@/src/features/categories/hooks/use-category-search";

import { CategoryList } from "@/src/features/categories/components/category-list";
import { CategorySearch } from "@/src/features/categories/components/category-search";
import { CategorySkeleton } from "@/src/features/categories/components/category-skeleton";
import { CategoryEmptyState } from "@/src/features/categories/components/category-empty-state";

import { ErrorState } from "@/src/shared/components/ui/error-state";

interface CategorySectionProps {
  branchId?: string;
  onCategoryClick?: (
    categoryId: string
  ) => void;
}

export function CategorySection({
  branchId,
  onCategoryClick,
}: CategorySectionProps) {
  const {
    search,
    setSearch,
    debouncedSearch,
  } = useCategorySearch();

  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useCategories({
    search:
      debouncedSearch || undefined,
    branchId,
  });

  if (isLoading) {
    return <CategorySkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed To Load Categories"
        description="Please try again."
        onRetry={() =>
          refetch()
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <CategorySearch
        value={search}
        onChange={setSearch}
      />

      {!categories ||
      categories.length === 0 ? (
        <CategoryEmptyState />
      ) : (
        <CategoryList
          categories={categories}
          onCategoryClick={(
            category
          ) =>
            onCategoryClick?.(
              category.id
            )
          }
        />
      )}
    </div>
  );
}