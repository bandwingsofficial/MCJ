"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { Card } from "@/src/shared/components/ui/card";

import { Loader } from "@/src/shared/components/ui/loader";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { EnrollmentForm } from "../components/form";

import { useEnrollment } from "../hooks";

interface EditEnrollmentPageProps {
  enrollmentId: string;
}

export function EditEnrollmentPage({
  enrollmentId,
}: EditEnrollmentPageProps) {
  const {
    enrollment,
    isLoading,
    error,
    refetch,
  } = useEnrollment(
    enrollmentId,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error || !enrollment) {
    return (
      <ErrorState
        title="Failed To Load Enrollment"
        description={
          error ??
          "Enrollment not found."
        }
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Enrollment"
        description="Update enrollment details."
      />

      <Card className="mt-4 p-6">
        <EnrollmentForm
          mode="edit"
          enrollment={
            enrollment
          }
        />
      </Card>
    </>
  );
}