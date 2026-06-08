"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCourses } from "@/src/features/courses/hooks/use-courses";

import { CourseList } from "@/src/features/courses/components/course-list";
import { CourseSkeleton } from "@/src/features/courses/components/course-skeleton";
import { CourseEmptyState } from "@/src/features/courses/components/course-empty-state";

interface CourseSectionProps {
  categoryId?: string;
  search?: string;
}

export function CourseSection({
  categoryId,
  search,
}: CourseSectionProps) {
  const router = useRouter();

  const {
    data: courses,
    isLoading,
    isError,
    refetch,
  } = useCourses({
    search:
      search || undefined,

    categoryId,
  });

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed To Load Courses"
        description="Please try again."
        onRetry={() =>
          refetch()
        }
      />
    );
  }

  if (
    !courses ||
    courses.length === 0
  ) {
    return (
      <CourseEmptyState />
    );
  }

  return (
    <CourseList
      courses={courses}
      onCourseClick={(
        course
      ) =>
        router.push(
          `/courses/${course.slug}`
        )
      }
    />
  );
}