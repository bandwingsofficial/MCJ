"use client";

import { EnrollmentCard } from "@/src/features/enrollments/components/EnrollmentCard";
import { EnrollmentEmpty } from "@/src/features/enrollments/components/EnrollmentEmpty";
import { EnrollmentSkeleton } from "@/src/features/enrollments/components/EnrollmentSkelton";
import { useMyEnrollments } from "@/src/features/enrollments/hooks/useMyEnrollments";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

export function EnrollmentPage() {
  const {
    enrollments,
    isLoading,
    error,
    refetch,
  } = useMyEnrollments();

  return (
    <main className="container mx-auto space-y-8 px-4 py-0">

      <PageHeader
        title="My Enrollments"
        description="View and manage all your course enrollments."
      />

      {isLoading && (
        <EnrollmentSkeleton />
      )}

      {!isLoading &&
        error && (
          <ErrorState
            title="Failed to load enrollments"
            description={error}
            onRetry={refetch}
          />
        )}

      {!isLoading &&
        !error &&
        enrollments.length ===
          0 && (
          <EnrollmentEmpty />
        )}

      {!isLoading &&
        !error &&
        enrollments.length >
          0 && (
          <div className="space-y-6">
            {enrollments.map(
              (
                enrollment,
              ) => (
                <EnrollmentCard
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
        )}

    </main>
  );
}