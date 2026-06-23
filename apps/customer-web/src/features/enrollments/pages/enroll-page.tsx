"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { appToast } from "@/src/shared/components/ui/toast";

import { useBatches } from "@/src/features/batches/hooks/useBatches";

import { useCourse } from "@/src/features/courses/hooks/use-course";

import { EnrollmentForm } from "@/src/features/enrollments/components/EnrollmentForm";
import { useEnroll } from "@/src/features/enrollments/hooks/useEnroll";

import type {
  EnrollmentFormValues,
} from "@/src/features/enrollments/schemas/enrollment.schema";

interface EnrollPageProps {
  slug: string;
}

export function EnrollPage({
  slug,
}: EnrollPageProps) {
  const router = useRouter();

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    refetch: refetchCourse,
  } = useCourse(slug);

  const {
    batches,
    isLoading: batchLoading,
    error: batchError,
    refetch: refetchBatches,
  } = useBatches();

  const {
    createEnrollment,
    isSubmitting,
    error,
  } = useEnroll();

  const courseBatches = useMemo(() => {
    if (!course) {
      return [];
    }

    return batches.filter(
      (batch) =>
        batch.courseId === course.id,
    );
  }, [
    batches,
    course,
  ]);

  const handleSubmit = async (
    values: EnrollmentFormValues,
  ) => {
    const enrollment =
      await createEnrollment({
        batchId:
          values.batchId,
        remarks:
          values.remarks,
      });

    if (!enrollment) {
      return;
    }

    appToast.success(
      "Enrollment created successfully.",
    );

    router.push(
      "/student/enrollments",
    );
  };

  if (courseLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <ErrorState
        title="Course Not Found"
        description="Unable to load the selected course."
        onRetry={() =>
          refetchCourse()
        }
      />
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">

      <PageHeader
        title="Course Enrollment"
        description="Select a batch and complete your enrollment."
      />

      <Card className="mt-8 p-6">

        <div className="mb-8">

          <h2 className="text-2xl font-semibold">
            {course.title}
          </h2>

          {course.tagline && (
            <p className="mt-2 text-muted-foreground">
              {course.tagline}
            </p>
          )}

        </div>

        <EnrollmentForm
          batches={
            courseBatches
          }
          loading={
            isSubmitting
          }
          batchLoading={
            batchLoading
          }
          batchError={
            batchError
          }
          submitError={
            error
          }
          onRetry={
            refetchBatches
          }
          onSubmit={
            handleSubmit
          }
        />

      </Card>

    </main>
  );
}