"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCourses } from "@/src/features/courses/hooks/use-courses";

import { CourseList } from "@/src/features/courses/components/course-list";
import { CourseSkeleton } from "@/src/features/courses/components/course-skeleton";
import { CourseEmptyState } from "@/src/features/courses/components/course-empty-state";

import { getCourseDetailPath } from "@/src/features/courses/utils/course-route.utils";

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

  /*
   * Keep the homepage focused.
   * Display up to 12 featured courses.
   */
  const visibleCourses = Array.isArray(courses)
    ? courses.slice(0, 12)
    : [];

  const handleCourseClick = (course: (typeof visibleCourses)[number]) => {
    router.push(getCourseDetailPath(course));
  };

  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            SECTION HEADER
        ====================================================== */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2563D9]">
              Learn & Grow
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Featured Courses
            </h2>

            <p className="mt-2.5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Explore our most popular learning programs and find the
              right course for your next step.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="
              w-fit
              rounded-lg
              border-slate-200
              bg-white
              px-5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              hover:bg-slate-50
            "
            onClick={() => router.push("/courses")}
          >
            View All
          </Button>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {isLoading && (
          <CourseSkeleton count={6} />
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {isError && (
          <ErrorState
            title="Failed to Load Courses"
            description="We couldn't load the featured courses right now. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}
        {!isLoading &&
          !isError &&
          visibleCourses.length === 0 && (
            <CourseEmptyState />
          )}

        {/* =====================================================
            COURSES
        ====================================================== */}
        {!isLoading &&
          !isError &&
          visibleCourses.length > 0 && (
            <CourseList
              courses={visibleCourses}
              onCourseClick={handleCourseClick}
            />
          )}
      </div>
    </section>
  );
}