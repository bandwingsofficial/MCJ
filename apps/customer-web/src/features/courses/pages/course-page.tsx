"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { CourseSection } from "@/src/features/courses/components/course-section";
import { CourseSearch } from "@/src/features/courses/components/course-search";
import { useCourseSearch } from "@/src/features/courses/hooks/use-course-search";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const { search, setSearch, debouncedSearch } = useCourseSearch();

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParams, setSearch]);

  return (
    <main className="w-full bg-slate-50/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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

        <CourseSection search={debouncedSearch || undefined} />
      </div>
    </main>
  );
}
