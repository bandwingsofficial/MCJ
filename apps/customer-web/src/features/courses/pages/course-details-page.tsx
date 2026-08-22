"use client";

import Link from "next/link";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { CourseDetails } from "@/src/features/courses/components/course-details";
import { CourseDetailsSkeleton } from "@/src/features/courses/components/course-details-skeleton";

interface CourseDetailsPageProps {
  courseId: string;
}

export function CourseDetailsPage({
  courseId,
}: CourseDetailsPageProps) {
  const {
    data: course,
    isLoading,
    isError,
    refetch,
  } = useCourse(courseId);

  /*
   * Loading state
   */
  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  /*
   * Error / course not found
   */
  if (isError || !course) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <ErrorState
            title="Course Not Found"
            description="We couldn't load this course. Please try again."
            onRetry={() => {
              void refetch();
            }}
          />

          <Link
            href="/courses"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Course successfully loaded
   *
   * All actual course UI is handled by CourseDetails.
   */
  return (
    <main className="w-full bg-white">
      <CourseDetails course={course} />
    </main>
  );
}