"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { useMyEnrollments } from "@/src/features/enrollments/hooks/useMyEnrollments";
import { StudentCourseCard } from "@/src/features/student-course/components/cards/StudentCourseCard";
import { CourseError } from "@/src/features/student-course/components/states/CourseError";
import { CourseSkeleton } from "@/src/features/student-course/components/states/CourseSkeleton";
import { EmptyCourses } from "@/src/features/student-course/components/states/EmptyCourses";

const ACTIVE_STATUSES = new Set(["PENDING", "ADMITTED"]);

export function StudentCoursesPage() {
  const { enrollments, isLoading, error, refetch } = useMyEnrollments();

  const learningEnrollments = enrollments.filter(
    (enrollment) =>
      ACTIVE_STATUSES.has(enrollment.status) && enrollment.isActive,
  );

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (error) {
    return <CourseError message={error} onRetry={refetch} />;
  }

  if (learningEnrollments.length === 0) {
    return <EmptyCourses />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Learning"
        description="Access and continue your enrolled courses."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {learningEnrollments.map((enrollment) => (
          <StudentCourseCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  );
}
