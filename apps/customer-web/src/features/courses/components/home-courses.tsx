"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCourses } from "@/src/features/courses/hooks/use-courses";
import { HomePopularCourseCard } from "@/src/features/courses/components/home-popular-course-card";
import { HomePopularCourseSkeleton } from "@/src/features/courses/components/home-popular-course-skeleton";

export function HomeCourses() {
  const router = useRouter();

  const popularQuery = useCourses({ isPopular: true });

  const fallbackQuery = useCourses({
    enabled:
      !popularQuery.isLoading &&
      !popularQuery.isError &&
      (popularQuery.data?.length ?? 0) === 0,
  });

  const courses = useMemo(() => {
    const source =
      (popularQuery.data?.length ?? 0) > 0
        ? popularQuery.data
        : fallbackQuery.data;

    return source?.slice(0, 10) ?? [];
  }, [popularQuery.data, fallbackQuery.data]);

  const isLoading =
    popularQuery.isLoading ||
    ((popularQuery.data?.length ?? 0) === 0 &&
      fallbackQuery.isLoading);

  const isError =
    popularQuery.isError && fallbackQuery.isError;

  const refetch = () => {
    void popularQuery.refetch();

    if ((popularQuery.data?.length ?? 0) === 0) {
      void fallbackQuery.refetch();
    }
  };

  return (
    <section className="w-full bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}

        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            {/* Small Label */}

            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-px w-6 bg-[#d4a84b]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b8922a]">
                Featured Learning
              </span>
            </div>

            {/* Heading */}

            <h2 className="text-[30px] font-bold leading-tight tracking-[-0.025em] text-[#0f2044] sm:text-[32px]">
              Popular Courses
            </h2>

            {/* Description */}

            <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-slate-500">
              Most loved courses by our students.
            </p>
          </div>

          {/* View All */}

          <Button
            variant="outline"
            onClick={() => router.push("/courses")}
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

        {isLoading && (
          <HomePopularCourseSkeleton count={4} />
        )}

        {/* Error */}

        {isError && (
          <ErrorState
            title="Failed To Load Courses"
            description="Please try again later."
            onRetry={refetch}
          />
        )}

        {/* Empty */}

        {!isLoading &&
          !isError &&
          courses.length === 0 && (
            <EmptyState
              title="No popular courses available"
              description="Check back soon for new courses."
            />
          )}

        {/* Courses */}

        {!isLoading &&
          !isError &&
          courses.length > 0 && (
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <HomePopularCourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </div>
          )}
      </div>
    </section>
  );
}