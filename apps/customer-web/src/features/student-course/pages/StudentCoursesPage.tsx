"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { useMyEnrollments } from "@/src/features/enrollments/hooks/useMyEnrollments";

import { StudentCourseCard } from "@/src/features/student-course/components/cards/StudentCourseCard";

import { CourseError } from "@/src/features/student-course/components/states/CourseError";
import { CourseSkeleton } from "@/src/features/student-course/components/states/CourseSkeleton";
import { EmptyCourses } from "@/src/features/student-course/components/states/EmptyCourses";

export function StudentCoursesPage() {
  const {
    enrollments,
    isLoading,
    error,
    refetch,
  } = useMyEnrollments();

  const learningEnrollments =
    enrollments.filter(
      (enrollment) =>
        enrollment.status ===
          "ADMITTED" &&
        enrollment.paymentStatus ===
          "PAID",
    );

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (error) {
    return (
      <CourseError
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (
    learningEnrollments.length ===
    0
  ) {
    return <EmptyCourses />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Learnings"
        description="Continue learning from your enrolled courses."
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {learningEnrollments.map(
          (
            enrollment,
          ) => (
            <StudentCourseCard
              key={
                enrollment.id
              }
              enrollment={
                enrollment
              }
            />
          ),
        )}
      </div>
    </div>
  );
}