"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { StudentManageDocumentsPanel } from "@/src/features/students/components/manage/student-manage-documents-panel";
import { StudentOverviewInformation } from "@/src/features/students/components/manage/student-overview-information";
import { studentService } from "@/src/features/students/services/student.service";
import type { Student } from "@/src/features/students/types/student.types";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageStudentPanel({ enrollment }: Props) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const studentId = enrollment.student?.id;
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await studentService.getStudent(studentId);
        setStudent(response.data);
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setStudent(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [enrollment.student?.id]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          Student profile is not available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StudentOverviewInformation student={student} />
      <StudentManageDocumentsPanel student={student} />
    </div>
  );
}
