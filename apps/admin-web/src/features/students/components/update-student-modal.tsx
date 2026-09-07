"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  getErrorCode,
  getErrorFieldErrors,
  getErrorMessage,
} from "@/src/core/utils/get-error-message";

import { EditStudentForm } from "@/src/features/students/components/edit-student-form";
import { useUpdateStudent } from "@/src/features/students/hooks/useUpdateStudent";
import type { CreateStudentFormValues } from "@/src/features/students/schemas/create-student.schema";
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

  const defaultValues = useMemo<CreateStudentFormValues | null>(() => {
    if (!student) {
      return null;
    }

    return mapStudentToFormValues(student);
  }, [student]);

  const applySubmitError = (error: unknown) => {
    const fieldErrors = getErrorFieldErrors(error);
    const errorCode = getErrorCode(error);
    const message = getErrorMessage(error);

    if (
      !fieldErrors.email &&
      (errorCode === "STUDENT_EMAIL_EXISTS" ||
        errorCode === "EMAIL_ALREADY_EXISTS")
    ) {
      fieldErrors.email = message;
    }

    if (
      !fieldErrors.phone &&
      (errorCode === "STUDENT_PHONE_EXISTS" ||
        errorCode === "PHONE_ALREADY_EXISTS")
    ) {
      fieldErrors.phone = message;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setServerErrors(fieldErrors);
    }

    appToast.error(message);
  };

  const handleSubmit = async (
    values: CreateStudentFormValues,
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
      applySubmitError(error);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Student"
      onClose={() => {
        if (isLoading) {
          return;
        }

        setServerErrors({});
        onClose();
      }}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      {student && defaultValues ? (
        <EditStudentForm
          key={student.id}
          defaultValues={defaultValues}
          profileImageUrl={student.profileImageUrl}
          isSubmitting={isLoading}
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => {
            if (isLoading) {
              return;
            }

            setServerErrors({});
            onClose();
          }}
        />
      ) : null}
    </Modal>
  );
}
