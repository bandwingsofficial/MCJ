"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CourseSection } from "@/src/features/courses/components/course-section";
import { CourseSearch } from "@/src/features/courses/components/course-search";
import { CourseFilters } from "@/src/features/courses/components/course-filters";
import { useCourseSearch } from "@/src/features/courses/hooks/use-course-search";
import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { useBranches } from "@/src/features/branches/hooks/useBranches";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const { search, setSearch, debouncedSearch } = useCourseSearch();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [selectedBranchId, setSelectedBranchId] = useState<string>();
  const { data: categories = [] } = useCategories();
  const { branches } = useBranches();

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const branchParam = searchParams.get("branch");

    if (categoryParam && categories.length > 0) {
      const match = categories.find(
        (category) =>
          category.id === categoryParam || category.slug === categoryParam,
      );
      if (match) {
        setSelectedCategoryId(match.id);
      }
    }

    if (branchParam && branches.length > 0) {
      const match = branches.find((branch) => branch.id === branchParam);
      if (match) {
        setSelectedBranchId(match.id);
      }
    }
  }, [branches, categories, searchParams]);

  const activeFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      categoryId: selectedCategoryId,
      branchId: selectedBranchId,
    }),
    [debouncedSearch, selectedBranchId, selectedCategoryId],
  );

  return (
    <main className="w-full bg-slate-50/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Explore Courses
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Discover courses designed to help you build real-world skills.
            </p>
          </div>

          <div className="w-full lg:w-[400px]">
            <CourseSearch value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CourseFilters
            categories={categories}
            branches={branches}
            selectedCategoryId={selectedCategoryId}
            selectedBranchId={selectedBranchId}
            onCategoryChange={setSelectedCategoryId}
            onBranchChange={setSelectedBranchId}
          />
        </div>

        <CourseSection
          search={activeFilters.search}
          categoryId={activeFilters.categoryId}
          branchId={activeFilters.branchId}
        />
      </div>
    </main>
  );
}
