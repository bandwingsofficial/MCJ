"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import { StudentDetails } from "@/src/features/students/components/StudentDetails";

import { useStudent } from "@/src/features/students/hooks";

interface StudentDetailsPageProps {
  id: string;
}

export function StudentDetailsPage({
  id,
}: StudentDetailsPageProps) {
  const router = useRouter();

  const {
  student,
  isLoading,
  error,
  refetch,
} = useStudent({
  id,
});

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error || !student) {
    return (
      <ErrorState
        title="Student Not Found"
        description={
  error ??
  "Unable to load student details."
}
        onRetry={() =>
          refetch()
        }
      />
    );
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Student Details"
        description="View complete student information."
        actions={
          <div className="flex gap-2">

            <Button
              variant="outline"
              onClick={() =>
                router.back()
              }
            >
              Back
            </Button>

            <Button
              onClick={() =>
                router.push(
                  `/admin/students/${id}/edit`
                )
              }
            >
              Edit Student
            </Button>

          </div>
        }
      />

      <Card className="p-6">

        <StudentDetails
          student={student}
          onBack={() =>
            router.back()
          }
          onEdit={() =>
            router.push(
              `/admin/students/${id}/edit`
            )
          }
        />

      </Card>

    </div>
  );
}