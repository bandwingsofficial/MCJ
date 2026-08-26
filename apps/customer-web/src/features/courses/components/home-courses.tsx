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
    ((popularQuery.data?.length ?? 0) === 0 && fallbackQuery.isLoading);

  const isError = popularQuery.isError && fallbackQuery.isError;

  const refetch = () => {
    void popularQuery.refetch();
    if ((popularQuery.data?.length ?? 0) === 0) {
      void fallbackQuery.refetch();
    }
  };

  return (
    <section className="w-full pt-4 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Popular Courses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Most loved courses by our students.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/courses")}>
            View All
          </Button>
        </div>

        {isLoading && <HomePopularCourseSkeleton count={4} />}

        {isError && (
          <ErrorState
            title="Failed To Load Courses"
            description="Please try again later."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <EmptyState
            title="No popular courses available"
            description="Check back soon for new courses."
          />
        )}

        {!isLoading && !isError && courses.length > 0 && (
          <div className="grid grid-cols-1 items-stretch gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <HomePopularCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
