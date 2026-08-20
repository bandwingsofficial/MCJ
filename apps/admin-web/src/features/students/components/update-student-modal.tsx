"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

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

  const handleSubmit = async (
    values: StudentFormValues,
    image: File | null,
  ) => {
    if (!student) {
      return;
    }

    await updateStudent(
      student.id,
      toUpdateStudentRequest(values),
      image,
    );
    appToast.success("Student updated successfully");
    await onSuccess();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Edit Student"
      onClose={onClose}
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
          onSubmit={async (values, image) => {
            try {
              await handleSubmit(values, image);
            } catch (error) {
              appToast.error(getErrorMessage(error));
            }
          }}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}
