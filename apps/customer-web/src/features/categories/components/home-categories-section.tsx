"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { HomeCategoryCard } from "@/src/features/categories/components/home-category-card";
import { CategorySkeleton } from "@/src/features/categories/components/category-skeleton";
import { CategoryEmptyState } from "@/src/features/categories/components/category-empty-state";

export function HomeCategoriesSection() {
  const router = useRouter();

  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useCategories();

  const visibleCategories = categories?.slice(0, 6) ?? [];

  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50/30 to-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}

        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            {/* Small Label */}

            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-px w-6 bg-[#d4a84b]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b8922a]">
                Learn & Grow
              </span>
            </div>

            {/* Heading */}

            <h2 className="text-[30px] font-bold leading-tight tracking-[-0.025em] text-[#0f2044] sm:text-[32px]">
              Explore Categories
            </h2>

            {/* Description */}

            <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-slate-500">
              Discover courses across multiple domains.
            </p>
          </div>

          {/* View All */}

          <Button
            variant="outline"
            onClick={() => router.push("/categories")}
            className="
              shrink-0
              rounded-lg
              border-slate-200
              bg-white
              px-4
              py-2
              text-xs
              font-medium
              text-[#0f2044]
              shadow-sm
              transition-all
              duration-200
              hover:border-[#d4a84b]/60
              hover:bg-[#fdf8ef]
              hover:text-[#b8922a]
            "
          >
            View All
          </Button>
        </div>

        {/* Loading */}

        {isLoading && <CategorySkeleton />}

        {/* Error */}

        {isError && (
          <ErrorState
            title="Failed To Load Categories"
            description="Please try again later."
            onRetry={refetch}
          />
        )}

        {/* Empty */}

        {!isLoading &&
          !isError &&
          visibleCategories.length === 0 && (
            <CategoryEmptyState />
          )}

        {/* Categories */}

        {!isLoading &&
          !isError &&
          visibleCategories.length > 0 && (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCategories.map((category) => (
                <HomeCategoryCard
                  key={category.id}
                  category={category}
                  onClick={(selected) =>
                    router.push(
                      `/courses?category=${selected.slug}`
                    )
                  }
                />
              ))}
            </div>
          )}
      </div>
    </section>
  );
}