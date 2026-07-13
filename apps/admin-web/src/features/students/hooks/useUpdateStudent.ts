"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { studentService } from "@/src/features/students/services/student.service";

import type {
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";

interface UpdateStudentPayload {
  id: string;

  payload: UpdateStudentRequest;

  image?: File | null;
}

interface UseUpdateStudentReturn {
  isLoading: boolean;

  updateStudent: (
    id: string,
    payload: UpdateStudentRequest,
    image?: File | null
  ) => Promise<boolean>;
}

export const useUpdateStudent =
  (
    onSuccess?: () => void
  ): UseUpdateStudentReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const updateStudent =
      async (
        id: string,
        payload: UpdateStudentRequest,
        image?: File | null
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const requestPayload: UpdateStudentRequest =
            {
              ...payload,
            };

          if (image) {
            const uploadResponse =
              await studentService.uploadStudentImage(
                image
              );

            requestPayload.profileImageFileId =
              uploadResponse.data.fileId;
          }

          const response =
            await studentService.updateStudent(
              id,
              requestPayload
            );

          appToast.success(
            response.message
          );

          onSuccess?.();

          return true;
        } catch (error) {
          appToast.error(
            error instanceof Error
              ? error.message
              : "Failed to update student"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      updateStudent,
    };
  };