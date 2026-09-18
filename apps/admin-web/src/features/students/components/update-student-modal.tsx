"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  getErrorCode,
  getErrorFieldErrors,
  getErrorMessage,
} from "@/src/core/utils/get-error-message";
import {
  getUploadFileId,
  withImageCacheBust,
} from "@/src/shared/utils/upload-image.util";

import { EditStudentForm } from "@/src/features/students/components/edit-student-form";
import { useUpdateStudent } from "@/src/features/students/hooks/useUpdateStudent";
import type { CreateStudentFormValues } from "@/src/features/students/schemas/create-student.schema";
import { studentService } from "@/src/features/students/services/student.service";
import type {
  StudentListItem,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const defaultValues = useMemo<CreateStudentFormValues | null>(() => {
    if (!student) {
      return null;
    }

    return mapStudentToFormValues(student);
  }, [student]);

  const profileImageUrl = useMemo(() => {
    if (!student?.profileImageUrl) {
      return null;
    }

    return withImageCacheBust(student.profileImageUrl, student.updatedAt);
  }, [student?.profileImageUrl, student?.updatedAt]);

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
      let profileImageFileId: string | null | undefined;

      if (image) {
        setIsUploadingImage(true);

        try {
          const uploadResponse = await studentService.uploadStudentImage(image);
          profileImageFileId = getUploadFileId(uploadResponse);
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: UpdateStudentRequest = {
        ...toUpdateStudentRequest(values),
        ...(profileImageFileId !== undefined ? { profileImageFileId } : {}),
      };

      await updateStudent(student.id, payload);
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
        if (isLoading || isUploadingImage) {
          return;
        }

        setServerErrors({});
        onClose();
      }}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      {student && defaultValues ? (
        <EditStudentForm
          key={`${student.id}-${student.updatedAt}`}
          defaultValues={defaultValues}
          profileImageUrl={profileImageUrl}
          isSubmitting={isLoading || isUploadingImage}
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => {
            if (isLoading || isUploadingImage) {
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
