"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  getErrorFieldErrors,
  getErrorMessage,
} from "@/src/core/utils/get-error-message";

import { StudentForm } from "@/src/features/students/components/student-form";
import { useUpdateStudent } from "@/src/features/students/hooks/useUpdateStudent";
import type { StudentFormValues } from "@/src/features/students/schemas/student.schema";
import type { StudentListItem } from "@/src/features/students/types/student.types";
import {
  mapStudentToFormValues,
  toUpdateStudentRequest,
} from "@/src/features/students/utils/student-form.utils";

interface UpdateStudentModalProps {
  open: boolean;
  student: StudentListItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function UpdateStudentModal({
  open,
  student,
  onClose,
  onSuccess,
}: UpdateStudentModalProps) {
  const { updateStudent, isLoading } = useUpdateStudent();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (
    values: StudentFormValues,
    image: File | null,
  ) => {
    if (!student) {
      return;
    }

    setServerErrors({});
    try {
      await updateStudent(
        student.id,
        toUpdateStudentRequest(values),
        image,
      );
      appToast.success("Student updated successfully");
      await onSuccess();
      onClose();
    } catch (error) {
      const fieldErrors = getErrorFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setServerErrors(fieldErrors);
      }
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Student"
      onClose={() => {
        setServerErrors({});
        onClose();
      }}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      {student ? (
        <StudentForm
          key={student.id}
          mode="edit"
          defaultValues={mapStudentToFormValues(student)}
          profileImageUrl={student.profileImageUrl}
          isSubmitting={isLoading}
          submitLabel="Update Student"
          loadingLabel="Updating Student..."
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => {
            setServerErrors({});
            onClose();
          }}
        />
      ) : null}
    </Modal>
  );
}
