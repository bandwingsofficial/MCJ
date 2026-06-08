"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCourses } from "@/src/features/courses/hooks/use-courses";

import { CourseList } from "@/src/features/courses/components/course-list";
import { CourseSkeleton } from "@/src/features/courses/components/course-skeleton";
import { CourseEmptyState } from "@/src/features/courses/components/course-empty-state";

export function FeaturedCoursesSection() {
  const router = useRouter();

  const {
    data: courses,
    isLoading,
    isError,
    refetch,
  } = useCourses({
    isFeatured: true,
  });

  const visibleCourses =
    courses?.slice(0, 6) ?? [];

  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">
              Featured Courses
            </h2>

            <p className="mt-3 text-muted-foreground">
              Explore our most popular learning programs.
            </p>
          </div>

          <Button
            onClick={() =>
              router.push("/courses")
            }
          >
            View All
          </Button>
        </div>

        {isLoading && (
          <CourseSkeleton count={3} />
        )}

        {isError && (
          <ErrorState
            title="Failed To Load Courses"
            description="Please try again."
            onRetry={() =>
              refetch()
            }
          />
        )}

        {!isLoading &&
          !isError &&
          visibleCourses.length === 0 && (
            <CourseEmptyState />
          )}

        {!isLoading &&
          !isError &&
          visibleCourses.length > 0 && (
            <CourseList
              courses={visibleCourses}
              onCourseClick={(
                course
              ) =>
                router.push(
                  `/courses/${course.slug}`
                )
              }
            />
          )}
      </div>
    </section>
  );
}