"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { Student } from "@/src/features/students/types/student.types";
import type { StudentEnrollmentFormValues } from "@/src/features/students/schemas/student-enrollment.schema";
import { formatCourseFee } from "@/src/features/courses/utils/format-course-fee.util";
import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";
import { StudentEnrollmentForm } from "@/src/features/students/components/manage/student-enrollment-form";

interface Props {
  open: boolean;
  student: Student;
  enrollment: Enrollment;
  branchMap?: Record<string, string>;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

function formatBatchLabel(enrollment: Enrollment): string {
  const name = enrollment.batch?.name ?? "—";
  const code = enrollment.batch?.code;

  return code ? `${name} (${code})` : name;
}

function formatTrainerNames(enrollment: Enrollment): string {
  const trainers = enrollment.batch?.trainers ?? [];

  if (!trainers.length) {
    return "—";
  }

  return trainers
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" "),
    )
    .join(", ");
}

export function UpdateStudentEnrollmentModal({
  open,
  student,
  enrollment,
  branchMap = {},
  onClose,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<StudentEnrollmentFormValues> = {
    batchId: enrollment.batch?.id ?? "",
    feeAmount: normalizeMoney(enrollment.feeAmount),
    discountAmount: normalizeMoney(enrollment.discountAmount),
  };

  const derivedBranchName =
    enrollment.branch?.branchName ??
    branchMap[enrollment.branch?.id ?? ""] ??
    "—";

  const handleSubmit = async (values: StudentEnrollmentFormValues) => {
    setIsLoading(true);
    try {
      await enrollmentService.updateEnrollment(enrollment.id, {
        feeAmount: values.feeAmount,
        discountAmount: values.discountAmount ?? 0,
      });
      appToast.success("Enrollment updated successfully");
      await onSuccess();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Enrollment"
      onClose={onClose}
      contentClassName="w-[calc(100vw-2rem)] max-w-lg !overflow-y-auto !overflow-x-hidden"
    >
      <StudentEnrollmentForm
          key={enrollment.id}
          mode="edit"
          student={student}
          defaultValues={defaultValues}
          editBatchDetails={{
            batchLabel: formatBatchLabel(enrollment),
            courseTitle: enrollment.course?.title ?? "—",
            courseFee: formatCourseFee({
              isFree: enrollment.course?.isFree,
              originalPrice: enrollment.course?.originalPrice,
            }),
            branchName: derivedBranchName,
            categoryName: enrollment.category?.name ?? "—",
            trainerNames: formatTrainerNames(enrollment),
            startDate: enrollment.batch?.startDate ?? null,
            endDate: enrollment.batch?.endDate ?? null,
          }}
          isSubmitting={isLoading}
          submitLabel="Save Changes"
          loadingLabel="Saving..."
          onCancel={onClose}
          onSubmit={async (values) => {
            try {
              await handleSubmit(values);
            } catch (error) {
              appToast.error(getErrorMessage(error));
            }
        }}
      />
    </Modal>
  );
}
