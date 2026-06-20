"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Button } from "@/src/shared/components/ui/button";
import { appToast } from "@/src/shared/components/ui/toast";

import { StudentForm } from "@/src/features/students/components/StudentForm";

import { studentService } from "@/src/features/students/services/student.service";

import {
  CreateStudentRequest,
} from "@/src/features/students/types/student.types";

export function StudentCreatePage() {
  const router = useRouter();

  const handleSubmit = async (
    values: CreateStudentRequest
  ) => {
    try {
      await studentService.createStudent(
        values
      );

      appToast.success(
        "Student created successfully."
      );

      router.push(
        "/admin/students"
      );
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to create student."
      );
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Create Student"
        description="Create a new student"
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
          submitLabel="Create Student"
          onSubmit={
            handleSubmit
          }
        />

      </Card>

    </div>
  );
}