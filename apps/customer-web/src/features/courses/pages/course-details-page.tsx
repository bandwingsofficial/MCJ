"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCourse } from "@/src/features/courses/hooks/use-course";

import { CourseDetails } from "@/src/features/courses/components/course-details";
import { CourseDetailsSkeleton } from "@/src/features/courses/components/course-details-skeleton";

interface CourseDetailsPageProps {
  slug: string;
}

export function CourseDetailsPage({
  slug,
}: CourseDetailsPageProps) {
  const {
    data: course,
    isLoading,
    isError,
    refetch,
  } = useCourse(slug);

  if (isLoading) {
    return (
      <CourseDetailsSkeleton />
    );
  }

  if (isError || !course) {
    return (
      <ErrorState
        title="Course Not Found"
        description="Unable to load course details."
        onRetry={() =>
          refetch()
        }
      />
    );
  }

  return (
    <CourseDetails
      course={course}
    />
  );
}