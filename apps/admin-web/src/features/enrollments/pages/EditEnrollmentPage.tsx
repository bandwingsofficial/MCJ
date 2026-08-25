"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { CreateEnrollmentForm } from "../components/form/CreateEnrollmentForm";
import { useEnrollment } from "../hooks";

interface EditEnrollmentPageProps {
  enrollmentId: string;
}

export function EditEnrollmentPage({
  enrollmentId,
}: EditEnrollmentPageProps) {
  const router = useRouter();
  const { enrollment, isLoading, error, refetch } = useEnrollment(enrollmentId);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !enrollment) {
    return (
      <ErrorState
        title="Failed To Load Enrollment"
        description={error ?? "Enrollment not found."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Enrollment"
        description="Update enrollment date, branch, batch, and student."
        actions={
          <Link
            href="/enrollments"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Enrollments
          </Link>
        }
      />

      <Card className="mt-4 p-6">
        <CreateEnrollmentForm
          mode="edit"
          enrollment={enrollment}
          onCancel={() => router.push("/enrollments")}
          onSuccess={() => router.push("/enrollments")}
        />
      </Card>
    </>
  );
}
