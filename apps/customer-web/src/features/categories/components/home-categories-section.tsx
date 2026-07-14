"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { CategoryList } from "@/src/features/categories/components/category-list";
import { CategorySkeleton } from "@/src/features/categories/components/category-skeleton";
import { CategoryEmptyState } from "@/src/features/categories/components/category-empty-state";

export function HomeCategoriesSection() {
  const router = useRouter();
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const visibleCategories = categories?.slice(0, 6) ?? [];

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Explore Categories</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Discover courses across multiple domains.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/categories")}>
            View All
          </Button>
        </div>

        {isLoading && <CategorySkeleton />}
        {isError && (
          <ErrorState title="Failed To Load Categories" description="Please try again later." onRetry={refetch} />
        )}
        {!isLoading && !isError && visibleCategories.length === 0 && <CategoryEmptyState />}
        {!isLoading && !isError && visibleCategories.length > 0 && (
          <CategoryList
            categories={visibleCategories}
            onCategoryClick={(category) => router.push(`/courses?category=${category.slug}`)}
          />
        )}
      </div>
    </section>
  );
}