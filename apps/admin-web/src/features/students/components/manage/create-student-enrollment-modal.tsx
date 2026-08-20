"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Student } from "@/src/features/students/types/student.types";
import type { StudentEnrollmentFormValues } from "@/src/features/students/schemas/student-enrollment.schema";
import { StudentEnrollmentForm } from "@/src/features/students/components/manage/student-enrollment-form";

interface Props {
  open: boolean;
  student: Student;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function CreateStudentEnrollmentModal({
  open,
  student,
  onClose,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: StudentEnrollmentFormValues) => {
    setIsLoading(true);
    try {
      await enrollmentService.createEnrollment({
        studentId: student.id,
        batchId: values.batchId,
        feeAmount: values.feeAmount,
        discountAmount: values.discountAmount ?? 0,
      });
      appToast.success("Enrollment created successfully");
      await onSuccess();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Create Enrollment"
      onClose={onClose}
      contentClassName="w-[calc(100vw-2rem)] max-w-lg !overflow-y-auto !overflow-x-hidden"
    >
      <StudentEnrollmentForm
          key={open ? "create-enrollment-open" : "create-enrollment-closed"}
          mode="create"
          student={student}
          isSubmitting={isLoading}
          submitLabel="Create Enrollment"
          loadingLabel="Creating..."
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              await handleSubmit(values);
            } catch (error) {
              appToast.error(
                `Failed to create enrollment\n${getErrorMessage(error)}`,
              );
            }
        }}
      />
    </Modal>
  );
}
