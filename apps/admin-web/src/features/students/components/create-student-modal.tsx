"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { StudentForm } from "@/src/features/students/components/student-form";
import { useCreateStudent } from "@/src/features/students/hooks/useCreateStudent";
import { toCreateStudentRequest } from "@/src/features/students/utils/student-form.utils";
import type { StudentFormValues } from "@/src/features/students/schemas/student.schema";
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

  const handleSubmit = async (
    values: StudentFormValues,
    image: File | null,
  ) => {
    const createdStudent = await createStudent(toCreateStudentRequest(values), image);
    appToast.success("Student created successfully");
    await onSuccess(createdStudent);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create Student"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      <StudentForm
        key={open ? "create-student-open" : "create-student-closed"}
        mode="create"
        isSubmitting={isLoading}
        submitLabel="Create Student"
        loadingLabel="Creating Student..."
        onSubmit={async (values, image) => {
          try {
            await handleSubmit(values, image);
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
