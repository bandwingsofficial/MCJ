"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  getErrorCode,
  getErrorFieldErrors,
  getErrorMessage,
} from "@/src/core/utils/get-error-message";

import { CreateStudentForm } from "@/src/features/students/components/create-student-form";
import { useCreateStudent } from "@/src/features/students/hooks/useCreateStudent";
import { toCreateStudentRequest } from "@/src/features/students/utils/student-form.utils";
import type { CreateStudentFormValues } from "@/src/features/students/schemas/create-student.schema";
import type { Student } from "@/src/features/students/types/student.types";

interface CreateStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void | Promise<void>;
}

export function CreateStudentModal({
  open,
  onClose,
  onSuccess,
}: CreateStudentModalProps) {
  const { createStudent, isLoading } = useCreateStudent();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

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
    setServerErrors({});
    try {
      const createdStudent = await createStudent(
        toCreateStudentRequest(values),
        image,
      );
      appToast.success("Student created successfully");
      await onSuccess(createdStudent);
      onClose();
    } catch (error) {
      applySubmitError(error);
    }
  };

  return (
    <Modal
      open={open}
      title="Create Student"
      onClose={() => {
        if (isLoading) {
          return;
        }

        setServerErrors({});
        onClose();
      }}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      <CreateStudentForm
        key={open ? "create-student-open" : "create-student-closed"}
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
    </Modal>
  );
}
