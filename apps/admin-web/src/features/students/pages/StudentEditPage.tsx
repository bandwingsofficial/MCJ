"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { appToast } from "@/src/shared/components/ui/toast";

import { StudentForm } from "@/src/features/students/components/StudentForm";

import { useStudent } from "@/src/features/students/hooks";

import { studentService } from "@/src/features/students/services/student.service";

import {
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";

interface Props {
  id: string;
}

export function StudentEditPage({
  id,
}: Props) {
  const router = useRouter();

  const {
  student,
  isLoading,
  error,
  refetch,
} = useStudent({
  id,
});

  const handleSubmit =
    async (
      values: UpdateStudentRequest
    ) => {
      try {
        await studentService.updateStudent(
          id,
          values
        );

        appToast.success(
          "Student updated successfully."
        );

        router.push(
          "/admin/students"
        );
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Failed to update student."
        );
      }
    };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !student) {
    return (
      <ErrorState
        title="Failed To Load Student"
        description={
  error ??
  "Student not found."
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
        title="Edit Student"
        description="Update student information"
        actions={
          <Button
            variant="outline"
            onClick={() =>
              router.back()
            }
          >
            Back
          </Button>
        }
      />

      <Card className="p-6">

        <StudentForm
          submitLabel="Update Student"
          defaultValues={{
            firstName:
              student.firstName,

            lastName:
              student.lastName,

            email:
              student.email,

            phone:
              student.phone,

            gender:
              student.gender,

            dateOfBirth:
              student.dateOfBirth.split(
                "T"
              )[0],

            addressLine1:
              student.addressLine1 ??
              "",

            addressLine2:
              student.addressLine2 ??
              "",

            city:
              student.city ??
              "",

            state:
              student.state ??
              "",

            country:
              student.country ??
              "",

            postalCode:
              student.postalCode ??
              "",

            qualification:
              student.qualification ??
              "",

            collegeName:
              student.collegeName ??
              "",

            specialization:
              student.specialization ??
              "",

            passingYear:
              student.passingYear ??
              undefined,

            parentName:
              student.parentName ??
              "",

            parentPhone:
              student.parentPhone ??
              "",

            emergencyContactName:
              student.emergencyContactName ??
              "",

            emergencyContactPhone:
              student.emergencyContactPhone ??
              "",

            admissionDate:
              student.admissionDate.split(
                "T"
              )[0],

            branchId:
              student.branchId,

            notes:
              student.notes ??
              "",

            status:
              student.status,
          }}
          onSubmit={
            handleSubmit
          }
        />

      </Card>

    </div>
  );
}