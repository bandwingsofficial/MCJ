"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourseBatches } from "@/src/features/batches/hooks/useCourseBatches";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { formatCoursePrice } from "@/src/features/courses/utils/course-display.utils";
import { EnrollmentForm } from "@/src/features/enrollments/components/EnrollmentForm";
import { useEnroll } from "@/src/features/enrollments/hooks/useEnroll";
import type { EnrollmentFormValues } from "@/src/features/enrollments/schemas/enrollment.schema";

interface EnrollPageProps {
  courseId: string;
}

export function EnrollPage({ courseId }: EnrollPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBatchId = searchParams.get("batchId") ?? undefined;

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    refetch: refetchCourse,
  } = useCourse(courseId);

  const {
    batches: courseBatches,
    isLoading: batchLoading,
    error: batchError,
    refetch: refetchBatches,
  } = useCourseBatches(course?.id);

  const { createEnrollment, isSubmitting, error } = useEnroll();

  const selectedBatch = useMemo(
    () => courseBatches.find((batch) => batch.id === preselectedBatchId),
    [courseBatches, preselectedBatchId],
  );

  const handleSubmit = async (values: EnrollmentFormValues) => {
    const enrollment = await createEnrollment({
      batchId: values.batchId,
      remarks: values.remarks,
    });

    if (!enrollment) {
      return;
    }

    appToast.success("Enrollment created successfully.");
    router.push("/student/my-learning");
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
        onRetry={() => refetchCourse()}
      />
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Review Enrollment"
        description="Confirm your batch selection and complete enrollment."
      />

      <Card className="mt-8 space-y-6 p-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-indigo-600">{course.code}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            {course.title}
          </h2>
          {course.tagline ? (
            <p className="mt-2 text-slate-600">{course.tagline}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>Category: {course.categoryName}</span>
            <span>Price: {formatCoursePrice(course)}</span>
            {selectedBatch ? (
              <>
                <span>Batch: {selectedBatch.name}</span>
                <span>
                  Branch: {selectedBatch.branch?.branchName ?? "—"}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <EnrollmentForm
          batches={courseBatches}
          defaultBatchId={preselectedBatchId}
          loading={isSubmitting}
          batchLoading={batchLoading}
          batchError={batchError}
          submitError={error}
          onRetry={refetchBatches}
          onSubmit={handleSubmit}
        />
      </Card>
    </main>
  );
}
