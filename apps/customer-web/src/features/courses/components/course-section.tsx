"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCourses } from "@/src/features/courses/hooks/use-courses";
import { HomePopularCourseCard } from "@/src/features/courses/components/home-popular-course-card";
import { HomePopularCourseSkeleton } from "@/src/features/courses/components/home-popular-course-skeleton";
import { CourseEmptyState } from "@/src/features/courses/components/course-empty-state";

interface CourseSectionProps {
  search?: string;
}

export function CourseSection({ search }: CourseSectionProps) {
  const {
    data: courses,
    isLoading,
    isError,
    refetch,
  } = useCourses({
    search: search || undefined,
  });

  if (isLoading) {
    return <HomePopularCourseSkeleton count={8} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed To Load Courses"
        description="Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!courses || courses.length === 0) {
    return <CourseEmptyState hasSearch={Boolean(search?.trim())} />;
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {courses.map((course) => (
        <HomePopularCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
